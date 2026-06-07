Za namestitev dockerja je potrebno sprožiti naslednje ukaze v tem vrstnem redu:

```
sudo apt update
sudo apt install ca-certificates curl
```

```
sudo install -m 0755 -d /etc/apt/keyrings
```

```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

```
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

```
sudo apt update
```

```
sudo apt install docker-ce docker-ce-cli containerd.io \
docker-buildx-plugin docker-compose-plugin
```

```
sudo usermod -aG docker $USER
```

```
apt install python3.12-venv
```

```
chmod +x run.sh
./run.sh
```

```
docker compose down
```