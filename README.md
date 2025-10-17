# Python-Postgres-Jenkins CI/CD

This project is a **Python-based web application** (built using **Django**) that has been fully **containerized with Docker** for consistent and portable deployments.  
It uses **Docker Compose** to orchestrate application services and spin up containers seamlessly.

The **CI/CD pipeline** is automated using **Jenkins**, which builds, tests, and deploys the application automatically.  
During deployment, Jenkins securely retrieves **PostgreSQL database credentials** from its **Credentials Manager** and exports them as environment variables to **Docker Compose**.  
These variables are then injected into the running container, enabling the application to connect to the **PostgreSQL database** that I set up & hosted on the same server (host machine).

The following project was setup by me in order to avoid manual deployment process that was being followed from a long time. The setup ensures a completely automated and reproducible deployment workflow that eliminates manual configuration, secures sensitive credentials, and demonstrates practical integration of Github, Docker, Docker Compose, Jenkins, and PostgreSQL in a real-world DevOps pipeline.

---

# Table of Contents

1. [Project Overview](#python-postgres-jenkins-cicd)
2. [Tech Stack & Tools](#tech-stack--tools)
3. [Deployment Flow](#deployment-flow)
4. [Setting up Project Environment](#setting-up-project-environment)
   - [1. Setting Up Jenkins](#1-setting-up-jenkins)
   - [2. Setting Up Docker](#2-setting-up-docker)
   - [3. Setting Up PostgreSQL Database](#3-setting-up-postgresql-database)
   - [4. Integrating Jenkins and Github](#4-integrating-jenkins-and-githubsource-code-management-tool)
   - [5. Adding Database Credentials to Jenkins](#5-adding-database-credentials-to-jenkins-to-avoid-hard-coding)
5. [Dockerizing the application](#dockerizing-the-application)
6. [Container Orchestration with Docker Compose](#container-orchestration-with-docker-compose)
7. [Jenkinsfile for automation](#jenkinsfile-for-automation)
8. [CI/CD with Jenkins](#cicd-with-jenkins)

---

# Tech Stack & Tools

- **Python (Django)** — Backend web framework  
- **PostgreSQL** — Relational database  
- **Docker** — Containerization  
- **Docker Compose** — Multi-container orchestration  
- **Jenkins** — Continuous Integration & Deployment  
- **GitHub** — Version control and source management  

---

# Deployment Flow

1. **Code Push** → Application source is pushed to GitHub.
2. **DB Setup** → Postgresql set-up & hosted on host machine. 
3. **Jenkins Trigger** → Jenkins pipeline starts automatically.   
4. **Credential Injection** → Jenkins exports DB credentials to Docker Compose.  
5. **Container Startup** → Docker Compose builds docker images using docker file, spins up containers and connects to PostgreSQL DB.  
6. **Deployment Complete** → Application runs successfully on the host machine.

---

# Setting up Project Environment
### 1. Setting Up Jenkins
> Update System Packages
```bash
sudo apt update
sudo apt upgrade -y
```
> Install Java & verify
```bash
sudo apt install fontconfig openjdk-17-jre -y
java -version
```
> Add Jenkins Repository Key
```bash
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
```
> Add Jenkins APT Repository
```bash
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
```
> Install Jenkins
```bash
sudo apt update
sudo apt install jenkins -y
```
> Start and Enable Jenkins Service
```bash
sudo systemctl start jenkins
sudo systemctl enable jenkins
sudo systemctl status jenkins
```
> Allow Jenkins Through Firewall
```bash
sudo ufw allow 8080/tcp
sudo ufw status
```  
> Get Initial Admin Password
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```
> Access Jenkins in Browser
```bash
http://YOUR_SERVER_IP:8080
```

### 2. Setting Up Docker
> Update System
```bash
sudo apt update
sudo apt upgrade -y
```
> Install Required Dependencies
```bash
sudo apt install apt-transport-HTTPS ca-certificates curl software-properties-common -y
```
> Add Docker GPG Key
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```
> Add Docker Repository
```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```
> Install Docker Engine, CLI & Compose Plugin
```bash
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
```
> Enable & Start Docker Service
```bash
sudo systemctl enable docker
sudo systemctl start docker
sudo systemctl status docker
```
> Allow Your User to Use Docker Without sudo and apply the changes
```bash
sudo usermod -aG docker $USER
newgrp docker
```
> Enable Docker to Start on Boot
```bash
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
```
> Give Jenkins Docker Permissions
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### 3. Setting Up PostgreSQL Database
> Update the system
```bash
sudo apt update
sudo apt upgrade -y
```
> Install PostgreSQL
```bash  
sudo apt install postgresql postgresql-contrib -y
```
> Start and enable PostgreSQL service
```bash  
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql
```
> Switch to default PostgreSQL user
```bash  
sudo -i -u postgres
```
> Access PostgreSQL prompt
```bash  
psql
```
> Create a new database
```bash  
CREATE DATABASE mydatabase;
```
> Create a new PostgreSQL user
```bash
CREATE USER myuser WITH ENCRYPTED PASSWORD 'mypassword';
```
> Grant privileges to the user on the database
```bash  
GRANT ALL PRIVILEGES ON DATABASE mydatabase TO myuser;
```
> Exit PostgreSQL and postgres user
```bash  
\q
exit
```
> Test login with new user
```bash
psql -h localhost -U myuser -d mydatabase
```
> Also make sure postgresql.conf allows listening on other IPs
```bash  
sudo nano /etc/postgresql/15/main/postgresql.conf
```
> change #listen_addresses = 'localhost' -> listen_addresses = '*'
>Add an entry to allow connections over the network
```bash  
host    mydatabase    myuser    192.168.1.50/32    md5 (for specific ip)
host    mydatabase    myuser    192.168.1.0/24    md5  (for a subnet)
```

### 4. Integrating Jenkins and Github(Source Code Management Tool)
**Please find the Step-by-Step Guide to integrate Jenkins and Github in the following repository**
[🔗](https://github.com/Vanisha1234/Jenkins-Sonar-Integration_CI-Pipeline)

### 5. Adding Database Credentials to Jenkins to avoid hard-coding
**STEP 1 :** Jenkins -> Manage Jenkins -> Credentials -> global -> add credentials \
**STEP 2 :** Provide the username and password of the database defined in the .env file of the source code. \
**STEP 3 :** Provide a unique id to identify db credentials in the jenkins secret manager and save the creds.

---

# Dockerizing the application
***Please find the docker file to containerize the application in the present repository along with added comments for explanation.***
[Dockerfile](https://github.com/Vanisha1234/python-postgres-jenkinsCI-CD/blob/a7f32dbdbba6a3ba4e5be6d80f6e06ef5111f5da/Dockerfile)

---

# Container Orchestration with Docker Compose 
***Please find the docker-compose file for container orchestration in the present repository along with added comments for explanation.***
[Docker Compose file](https://github.com/Vanisha1234/python-postgres-jenkinsCI-CD/blob/4daccbf3c6dbddf2b0efe22925f3fd427df65c54/docker-compose.yaml)

---

# Jenkinsfile for automation
***Please find the Jenkinsfile for automation and deployment in the present repository along with added comments for explanation.***
[Jenkinsfile](https://github.com/Vanisha1234/python-postgres-jenkinsCI-CD/blob/8297ca805bb3693da48ecd6c114f43814676fd25/JenkinsPipeline_ConsoleOutput)

---

# CI/CD with Jenkins

**STEP 1 :** Jenkins Dashboard > New Item > Provided Item Name > Select Pipeline \
**STEP 2 :** Pipeline > Choose Definition as Pipeline Script from SCM > Choose SCM as Git \
**STEP 3 :** Provide Git Repo URL and github credentials id under which git token for integration was stored. \
**STEP 4 :** Specify the Git Branch from where the code will be pulled.

## ⚠️ Key Points to Note
- Do allow the IP of the host on which the project is being deployed in the `settings.py` file (`ALLOWED_HOSTS` section).


