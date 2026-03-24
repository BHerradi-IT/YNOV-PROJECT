pipeline {
    agent any

    environment {
        IMAGE_NAME = "ynov-project-image"
        CONTAINER_NAME = "ynov-project-container"
    }

    stages {
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/BHerradi-IT/YNOV-PROJECT.git'
            }
        }

        stage('Build Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME} ."
            }
        }

        stage('Stop Old Container') {
            steps {
                sh "docker rm -f ${CONTAINER_NAME} || true"
            }
        }

        stage('Run Container') {
            steps {
                sh "docker run -d --name ${CONTAINER_NAME} -p 8082:80 ${IMAGE_NAME}"
            }
        }
    }
}
