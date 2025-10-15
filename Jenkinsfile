pipeline {
    agent any

    environment {
        PROJECT_NAME = "vtryon-2"
        DB_NAME = "your_database_name"
    }

    stages {
        stage('Build and Deploy') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'your_dbcredential_id_jenkins', usernameVariable: 'DB_USER', passwordVariable: 'DB_PASSWORD')]) {
                    sh '''
                        echo "Building and deploying ${PROJECT_NAME}..."

                        # Pass env vars to docker compose
                        export DB_USER=$DB_USER
                        export DB_PASSWORD=$DB_PASSWORD
                        export DB_NAME=${DB_NAME}
                        export DB_HOST=your_db_host
                        export DB_PORT=your_db_port

                        # Stop any previous containers
                        docker compose down --volumes --remove-orphans

                        # Build fresh images
                        docker compose build --no-cache

                        # Run in detached mode
                        docker compose up -d

                        # Automatically remove old images after build
                        docker image prune -f

                        echo "Deployment complete. Containers running:"
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