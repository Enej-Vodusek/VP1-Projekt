FROM python:3.11-slim

WORKDIR /model

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p models

CMD ["sleep", "infinity"]
