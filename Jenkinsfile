pipeline {
    agent any

    environment {
        IMAGE_NAME = "ynov-project"
        CONTAINER_NAME = "ynov-container"
    }

    stages {

        stage('Clone') {
            steps {
                echo 'Cloning repository...'
                git 'https://github.com/BHerradi-IT/YNOV-PROJECT.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                sh 'docker build -t $IMAGE_NAME .'
            }
        }

        stage('Stop Old Container') {
            steps {
                echo 'Stopping old container if exists...'
                sh '''
                docker stop $CONTAINER_NAME || true
                docker rm $CONTAINER_NAME || true
                '''
            }
        }

        stage('Run Container') {
            steps {
                echo 'Running new container...'
                sh '''
                docker run -d -p 8081:80 --name $CONTAINER_NAME $IMAGE_NAME
                '''
            }
        }
    }
}
