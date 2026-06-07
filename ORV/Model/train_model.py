import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split


# Osnovne nastavitve

BASE_DIR = Path(__file__).resolve().parent # mapa, kjer je train_model.py
DATASET_DIR = BASE_DIR.parent / "Orv_preprocessing" / "dataset" / "processed" # mapa, kjer so pripravljene slike

MODEL_DIR = BASE_DIR / "models" # mapa, kamor se shrani model
RESULTS_DIR = BASE_DIR / "results" # mapa, kamor se shranijo rezultati

MODEL_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)

IMAGE_SIZE = (224, 224) # vse slike se zmanjšajo/povečajo na 224×224
BATCH_SIZE = 16 # model obdeluje 16 slik naenkrat
EPOCHS = 15 # prva faza učenja traja največ 15 epoch
LEARNING_RATE = 0.0001 # hitrost učenja
VALIDATION_SPLIT = 0.2 # 20 % slik gre za validacijo
SEED = 42 # da je delitev vedno enaka

"""
Prva faza:
MobileNetV2 je zamrznjen, uči se samo glava modela

Druga faza:
del MobileNetV2 se odklene, model se bolj prilagodi datasetu
"""

FINE_TUNE_EPOCHS = 10
FINE_TUNE_LEARNING_RATE = 0.00001
FINE_TUNE_AT = 100

THRESHOLD_VALUES = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9]


# Preverjanje dataseta

def check_dataset():
    if not DATASET_DIR.exists():
        raise FileNotFoundError(f"Dataset folder ne obstaja: {DATASET_DIR}")

    pencil_dir = DATASET_DIR / "pencil"
    no_pencil_dir = DATASET_DIR / "no_pencil"

    if not pencil_dir.exists() or not no_pencil_dir.exists():
        raise FileNotFoundError(
            "Dataset mora vsebovati mapi 'pencil' in 'no_pencil'."
        )

    pencil_count = len(list(pencil_dir.glob("*")))
    no_pencil_count = len(list(no_pencil_dir.glob("*")))

    print("Dataset:", DATASET_DIR)
    print("pencil slike:", pencil_count)
    print("no_pencil slike:", no_pencil_count)


# Priprava datasetov
"""
prebere sliko iz diska
dekodira sliko
pretvori jo v RGB s 3 kanali
spremeni velikost na 224x224
vrne sliko in label
"""
def load_and_preprocess_image(image_path, label):
    image = tf.io.read_file(image_path)
    image = tf.image.decode_image(image, channels=3, expand_animations=False)
    image = tf.image.resize(image, IMAGE_SIZE)
    image.set_shape(IMAGE_SIZE + (3,))

    return image, label

# Iz slik naredi TensorFlow dataset
def create_datasets():
    image_paths = []
    labels = []

    class_names = ["no_pencil", "pencil"]  # razreda: 0 = no_pencil, 1 = pencil

    for label, class_name in enumerate(class_names):
        class_dir = DATASET_DIR / class_name

        # Preberemo vse slike iz trenutne mape
        for image_path in class_dir.glob("*"):
            if image_path.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
                image_paths.append(str(image_path))  # shranimo pot do slike
                labels.append(label)                 # shranimo pripadajočo oznako

    # Razdelimo podatke na učni in validacijski del
    train_paths, val_paths, train_labels, val_labels = train_test_split(
        image_paths,
        labels,
        test_size=VALIDATION_SPLIT,
        random_state=SEED,
        stratify=labels,  # ohrani enako razmerje razredov
    )

    print("Razredi:", class_names)
    print("Train no_pencil:", train_labels.count(0))
    print("Train pencil:", train_labels.count(1))
    print("Validation no_pencil:", val_labels.count(0))
    print("Validation pencil:", val_labels.count(1))

    # Shranimo imena razredov
    with open(MODEL_DIR / "class_names.json", "w") as file:
        json.dump(class_names, file, indent=4)

    # Ustvarimo TensorFlow dataset za učenje in validacijo
    train_ds = tf.data.Dataset.from_tensor_slices((train_paths, train_labels))
    val_ds = tf.data.Dataset.from_tensor_slices((val_paths, val_labels))

    # Učni dataset premešamo, pripravimo slike, razdelimo v batch-e in optimiziramo nalaganje
    train_ds = train_ds.shuffle(buffer_size=len(train_paths), seed=SEED)
    train_ds = train_ds.map(
        load_and_preprocess_image,
        num_parallel_calls=tf.data.AUTOTUNE,
    )
    train_ds = train_ds.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)

    # Validacijski dataset samo pripravimo, razdelimo v batch-e in optimiziramo nalaganje
    val_ds = val_ds.map(
        load_and_preprocess_image,
        num_parallel_calls=tf.data.AUTOTUNE,
    )
    val_ds = val_ds.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)

    return train_ds, val_ds, class_names


# Gradnja modela
def build_model():
    # Umetno povečamo raznolikost slik med učenjem
    data_augmentation = tf.keras.Sequential(
        [
            tf.keras.layers.RandomFlip("horizontal"),
            tf.keras.layers.RandomRotation(0.08),
            tf.keras.layers.RandomZoom(0.1),
        ],
        name="data_augmentation",
    )

    # Naložimo prednaučen MobileNetV2 model brez zadnjega klasifikacijskega dela
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=IMAGE_SIZE + (3,),
        include_top=False,
        weights="imagenet",
    )

    # V prvi fazi učenja osnovnega modela ne spreminjamo
    base_model.trainable = False

    # Vhodna slika velikosti 224x224 s 3 barvnimi kanali
    inputs = tf.keras.Input(shape=IMAGE_SIZE + (3,))

    # Potek slike skozi model
    x = data_augmentation(inputs)                              # naključne spremembe slike
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x) # priprava slike za MobileNetV2
    x = base_model(x, training=False)                          # ekstrakcija značilk
    x = tf.keras.layers.GlobalAveragePooling2D()(x)            # zmanjšanje izhoda v vektor
    x = tf.keras.layers.Dropout(0.3)(x)                        # zmanjšanje overfittinga

    # Izhod: ena vrednost med 0 in 1
    outputs = tf.keras.layers.Dense(1, activation="sigmoid")(x)

    # Sestavimo celoten model
    model = tf.keras.Model(inputs, outputs)

    # Nastavimo način učenja modela
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )

    return model, base_model

# Callbacki

def create_callbacks():
    return [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=4,
            restore_best_weights=True,
        ),
        tf.keras.callbacks.ModelCheckpoint(
            MODEL_DIR / "best_pencil_model.keras",
            monitor="val_accuracy",
            save_best_only=True,
            mode="max",
        ),
    ]


# Risanje grafov

def save_training_plots(history):
    plt.figure()
    plt.plot(history.history["accuracy"], label="train accuracy")
    plt.plot(history.history["val_accuracy"], label="validation accuracy")
    plt.title("Točnost modela")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.legend()
    plt.savefig(RESULTS_DIR / "accuracy.png")
    plt.close()

    plt.figure()
    plt.plot(history.history["loss"], label="train loss")
    plt.plot(history.history["val_loss"], label="validation loss")
    plt.title("Loss modela")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.legend()
    plt.savefig(RESULTS_DIR / "loss.png")
    plt.close()


# Pridobivanje napovedi

def get_true_labels_and_probabilities(model, val_ds):
    probabilities = model.predict(val_ds, verbose=0).flatten()

    true_labels = []

    for _, labels in val_ds:
        true_labels.extend(labels.numpy().astype(int).flatten())

    return np.array(true_labels), probabilities


# Optimizacija thresholda

# Optimizacija thresholda

def optimize_threshold(model, val_ds):
    # Dobimo dejanske oznake in napovedane verjetnosti
    true_labels, probabilities = get_true_labels_and_probabilities(model, val_ds)

    results = []  # seznam rezultatov za različne threshold vrednosti

    print("\nOptimizacija thresholda...")

    # Preizkusimo več različnih threshold vrednosti
    for threshold in THRESHOLD_VALUES:
        # Če je verjetnost večja/enaka thresholdu, napovemo razred 1
        predicted_labels = (probabilities >= threshold).astype(int)

        # Izračunamo metrike uspešnosti
        accuracy = accuracy_score(true_labels, predicted_labels)
        precision = precision_score(true_labels, predicted_labels, zero_division=0)
        recall = recall_score(true_labels, predicted_labels, zero_division=0)
        f1 = f1_score(true_labels, predicted_labels, zero_division=0)

        # Ustvarimo confusion matrix
        matrix = confusion_matrix(true_labels, predicted_labels, labels=[0, 1])

        # Napačno sprejete slike: dejansko no_pencil, napovedano pencil
        false_accepts = int(matrix[0][1])

        # Napačno zavrnjene slike: dejansko pencil, napovedano no_pencil
        false_rejects = int(matrix[1][0])

        # Shranimo rezultate za trenutni threshold
        result = {
            "threshold": threshold,
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "false_accepts": false_accepts,
            "false_rejects": false_rejects,
            "confusion_matrix": matrix.tolist(),
        }

        results.append(result)

        # Izpišemo rezultate za trenutni threshold
        print(
            f"Threshold {threshold:.2f} -> "
            f"accuracy: {accuracy:.4f}, "
            f"precision: {precision:.4f}, "
            f"recall: {recall:.4f}, "
            f"false accepts: {false_accepts}, "
            f"false rejects: {false_rejects}"
        )

    # Za začetek vzamemo prvi rezultat kot najboljšega
    best_result = results[0]

    # Poiščemo najboljši threshold
    for result in results[1:]:
        # Boljši je tisti z višjo accuracy
        better_accuracy = result["accuracy"] > best_result["accuracy"]

        # Če je accuracy enaka, izberemo tistega z manj false accepts
        same_accuracy_less_false_accepts = (
            result["accuracy"] == best_result["accuracy"]
            and result["false_accepts"] < best_result["false_accepts"]
        )

        if better_accuracy or same_accuracy_less_false_accepts:
            best_result = result

    # Shranimo vse rezultate v JSON datoteko
    with open(RESULTS_DIR / "threshold_optimization.json", "w") as file:
        json.dump(results, file, indent=4)

    # Shranimo rezultate še v berljivo TXT datoteko
    with open(RESULTS_DIR / "threshold_optimization.txt", "w") as file:
        file.write("Threshold optimization results\n\n")

        for result in results:
            file.write(
                f"Threshold {result['threshold']:.2f} | "
                f"accuracy: {result['accuracy']:.4f} | "
                f"precision: {result['precision']:.4f} | "
                f"recall: {result['recall']:.4f} | "
                f"f1: {result['f1_score']:.4f} | "
                f"false_accepts: {result['false_accepts']} | "
                f"false_rejects: {result['false_rejects']}\n"
            )

        file.write("\nBest threshold:\n")
        file.write(json.dumps(best_result, indent=4))

    # Shranimo samo najboljši threshold za uporabo pri napovedovanju
    with open(MODEL_DIR / "best_threshold.json", "w") as file:
        json.dump(
            {
                "best_threshold": best_result["threshold"],
                "accuracy": best_result["accuracy"],
                "precision": best_result["precision"],
                "recall": best_result["recall"],
                "f1_score": best_result["f1_score"],
                "false_accepts": best_result["false_accepts"],
                "false_rejects": best_result["false_rejects"],
            },
            file,
            indent=4,
        )

    print("\nNajboljši threshold:")
    print(json.dumps(best_result, indent=4))

    return best_result

# Vrednotenje modela
def evaluate_model(model, val_ds, class_names, threshold):
    true_classes, probabilities = get_true_labels_and_probabilities(model, val_ds)
    predicted_classes = (probabilities >= threshold).astype(int)

    report = classification_report(
        true_classes,
        predicted_classes,
        labels=[0, 1],
        target_names=class_names,
        zero_division=0,
    )

    matrix = confusion_matrix(
        true_classes,
        predicted_classes,
        labels=[0, 1],
    )

    print("\nKončno vrednotenje z najboljšim thresholdom:")
    print("Threshold:", threshold)

    print("\nClassification report:")
    print(report)

    print("\nConfusion matrix:")
    print(matrix)

    with open(RESULTS_DIR / "classification_report.txt", "w") as file:
        file.write(f"Threshold: {threshold}\n\n")
        file.write(report)

    with open(RESULTS_DIR / "confusion_matrix.txt", "w") as file:
        file.write(f"Threshold: {threshold}\n\n")
        file.write(str(matrix))


# Glavni program

if __name__ == "__main__":
    # Preverimo, ali dataset obstaja in ima pravilno strukturo
    check_dataset()

    # Pripravimo učni in validacijski dataset
    train_ds, val_ds, class_names = create_datasets()

    # Zgradimo model in osnovni MobileNetV2 model
    model, base_model = build_model()

    # Izpišemo strukturo modela
    model.summary()

    # Prva faza učenja: trenira se samo dodani klasifikacijski del
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=create_callbacks(),
    )

    print("\nZačetek fine-tuning faze...")

    # Odklenemo osnovni MobileNetV2 model za dodatno učenje
    base_model.trainable = True

    # Prvih nekaj slojev pustimo zamrznjenih
    for layer in base_model.layers[:FINE_TUNE_AT]:
        layer.trainable = False

    # Model ponovno prevedemo z manjšo learning rate za fine-tuning
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=FINE_TUNE_LEARNING_RATE),
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )

    # Druga faza učenja: fine-tuning dela MobileNetV2 modela
    fine_tune_history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=FINE_TUNE_EPOCHS,
        callbacks=create_callbacks(),
    )

    # Združimo rezultate prvega učenja in fine-tuninga za grafe
    for key in fine_tune_history.history:
        history.history[key].extend(fine_tune_history.history[key])

    model.save(MODEL_DIR / "pencil_classifier.keras")
    best_threshold_result = optimize_threshold(model, val_ds)
    best_threshold = best_threshold_result["threshold"]

    config = {
        "image_size": IMAGE_SIZE,
        "batch_size": BATCH_SIZE,
        "epochs": EPOCHS,
        "learning_rate": LEARNING_RATE,
        "validation_split": VALIDATION_SPLIT,
        "threshold": best_threshold,
        "model": "MobileNetV2 transfer learning",
        "classes": class_names,
        "fine_tune_epochs": FINE_TUNE_EPOCHS,
        "fine_tune_learning_rate": FINE_TUNE_LEARNING_RATE,
        "fine_tune_at": FINE_TUNE_AT,
        "threshold_values": THRESHOLD_VALUES,
    }

    # Shranimo nastavitve treninga v JSON datoteko
    with open(MODEL_DIR / "training_config.json", "w") as file:
        json.dump(config, file, indent=4)

    save_training_plots(history)
    evaluate_model(model, val_ds, class_names, best_threshold)

    print("\nModel je uspešno naučen.")
    print(f"Najboljši threshold: {best_threshold}")
    print(f"Model shranjen v: {MODEL_DIR / 'pencil_classifier.keras'}")
    print(f"Rezultati shranjeni v: {RESULTS_DIR}")