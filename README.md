# python-postgres-jenkinsCI-CD

# Setting up environment
- setting up jenkins
  Update System
sudo apt update
sudo apt upgrade -y
  Install Java & verify
sudo apt install fontconfig openjdk-17-jre -y
java -version
  Add Jenkins Repository Key
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
  Add Jenkins APT Repository
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
  Install Jenkins
sudo apt update
sudo apt install jenkins -y
  Start and Enable Jenkins Service
sudo systemctl start jenkins
sudo systemctl enable jenkins
sudo systemctl status jenkins
  Allow Jenkins Through Firewall
sudo ufw allow 8080/tcp
sudo ufw status
  Get Initial Admin Password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
  Access Jenkins in Browser
http://YOUR_SERVER_IP:8080



- setting up docker
  Update System
sudo apt update
sudo apt upgrade -y
  Install Required Dependencies
sudo apt install apt-transport-HTTPS ca-certificates curl software-properties-common -y
  Add Docker GPG Key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  Add Docker Repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  Install Docker Engine, CLI & Compose Plugin
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
  Enable & Start Docker Service
sudo systemctl enable docker
sudo systemctl start docker
sudo systemctl status docker
  Allow Your User to Use Docker Without sudo and apply the changes
sudo usermod -aG docker $USER
newgrp docker
  Enable Docker to Start on Boot
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
  Give Jenkins Docker Permissions
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins


  
- setting up postgres database
  Update the system
sudo apt update
sudo apt upgrade -y
  Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
  Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql
  Switch to default PostgreSQL user
sudo -i -u postgres
  Access PostgreSQL prompt
psql
  Create a new database
CREATE DATABASE mydatabase;
  Create a new PostgreSQL user
CREATE USER myuser WITH ENCRYPTED PASSWORD 'mypassword';
  Grant privileges to the user on the database
GRANT ALL PRIVILEGES ON DATABASE mydatabase TO myuser;
  Exit PostgreSQL and postgres user
\q
exit
  Test login with new user
psql -h localhost -U myuser -d mydatabase
  Also make sure postgresql.conf allows listening on other IPs
sudo nano /etc/postgresql/15/main/postgresql.conf
change #listen_addresses = 'localhost' -> listen_addresses = '*'
  Add an entry to allow connections over the network
host    mydatabase    myuser    192.168.1.50/32    md5 (for specific ip)
host    mydatabase    myuser    192.168.1.0/24    md5  (for a subnet)

- integrating Jenkins and github(Source Code Management Tool)
Please find the step-by-step guide to integrate Jenkins and Github in the following repository
https://github.com/Vanisha1234/Jenkins-Sonar-Integration_CI-Pipeline

- Adding Database Credentials to Jenkins to avoid hard-coding
Jenkins -> Manage Jenkins -> Credentials -> global -> add credentials
Provide the username and password of the database defined in the .env file of the source code.
provide a unique id to identify db credentials in the jenkins secret manager.

# Dockerizing the application
please find the docker file to containerize the application along with added comments for explanation in this repository-
https://github.com/Vanisha1234/Jenkins-Sonar-Integration_CI-Pipeline




