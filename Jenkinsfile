// Jenkinsfile -
// Automates deployment.
// Fetches DB credentials from Jenkins.
// Exports env vars for docker-compose.
// Runs docker compose down → docker compose build → docker compose up -d.
// Essentially triggers the building and running of your containers defined in docker-compose.yml.

pipeline {
    agent any                                                                 // Run on any available Jenkins agent

    environment {                                                             // Global environment variables for the pipeline
        PROJECT_NAME = "vtryon-2"
        DB_NAME = "your_database_name"
    }

    stages {
        stage('Build and Deploy') {
            steps {
                // Use Jenkins credentials for DB connection
                withCredentials([usernamePassword(credentialsId: 'your_dbcredential_id_jenkins', usernameVariable: 'DB_USER', passwordVariable: 'DB_PASSWORD')]) {
                    sh '''
                        echo "Building and deploying ${PROJECT_NAME}..."

                        # Export environment variables for docker-compose
                        export DB_USER=$DB_USER
                        export DB_PASSWORD=$DB_PASSWORD
                        export DB_NAME=${DB_NAME}
                        export DB_HOST=your_db_host
                        export DB_PORT=your_db_port

                        # Stop and remove any previously running containers and volumes
                        docker compose down --volumes --remove-orphans

                        # Build new Docker images from Dockerfile
                        docker compose build --no-cache

                        # Start containers in detached mode
                        docker compose up -d

                        echo "Deployment complete. Containers running:"
                        # Show running containers
                        docker ps
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
        }
    }
}
