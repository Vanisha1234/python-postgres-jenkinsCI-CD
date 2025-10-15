FROM python:3.11                                               # Base image: official Python 3.11 image from Docker Hub

ENV PYTHONDONTWRITEBYTECODE=1                                  # Prevent Python from writing .pyc files
ENV PYTHONUNBUFFERED=1                                         # Enable unbuffered output (logs are printed instantly)

WORKDIR /app                                                   # Set working directory inside the container

COPY requirements.txt /app/                                    # Set working directory inside the container
RUN apt-get update && apt-get install -y libpq-dev gcc && \    # Install system dependencies (libpq-dev for PostgreSQL, gcc for compiling packages)
    pip install --upgrade pip && \                             # Upgrade pip and install Python dependencies
    pip install -r requirements.txt && \
    apt-get clean && rm -rf /var/lib/apt/lists/*               # Clean up apt cache to reduce image size

COPY . /app/                                                   # Copy the rest of the application code into the container

EXPOSE 8000                                                    # Expose port 8000 to be accessible from outside the container

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]       # Default command to run Django development server
