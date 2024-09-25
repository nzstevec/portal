ARG PYTHON_VERSION=3.11.9
FROM python:${PYTHON_VERSION}-slim AS base

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

# Set the working directory to /app
WORKDIR /app

# Copy the requirements file to the working directory
COPY backend/requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code to the working directory
COPY backend/ .

COPY frontend/build ../frontend/build

# Update package repository and install necessary tools
RUN apt-get update && apt-get install -y procps

# Copy the start.sh script into the container
COPY backend/start.sh /usr/local/bin/start.sh

# Make the script executable
RUN chmod +x /usr/local/bin/start.sh

# Expose the port the application will run on
EXPOSE 8080
EXPOSE 8501

# Set the entry point to start.sh
ENTRYPOINT ["/usr/local/bin/start.sh"]
