FROM python:3.12-alpine

WORKDIR /app

# Ensure unbuffered Python output for real-time docker logs
ENV PYTHONUNBUFFERED=1
ENV PORT=80

# Copy project files
COPY . /app

# Ensure data directory exists for state persistence
RUN mkdir -p /app/data

EXPOSE 80

CMD ["python", "server.py"]
