pipeline {
    agent any

    environment {
        IMAGE_NAME = "ynov-project-image"
        CONTAINER_NAME = "ynov-project-container"
        SONAR_HOST_URL = "http://192.168.142.143:9000"
    }

    stages {
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/BHerradi-IT/YNOV-PROJECT.git'
            }
        }

        // ========== مرحلة SonarQube ==========
        stage('SonarQube Analysis') {
            steps {
                // استخدام الـ environment مباشرة مع withSonarQubeEnv() بدون اسم محدد
                withSonarQubeEnv() { 
                    sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=ynov-react-app \
                        -Dsonar.projectName="YNOV React App" \
                        -Dsonar.projectVersion=1.0 \
                        -Dsonar.sources=frontend/src \
                        -Dsonar.exclusions=**/node_modules/**,**/*.test.js \
                        -Dsonar.host.url=${SONAR_HOST_URL}
                    '''
                }
            }
        }

        // ========== مرحلة فحص الجودة ==========
        stage('Quality Gate Check') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // ========== مراحل بناء Docker ونشر التطبيق ==========
        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME} ."
                }
            }
        }

        stage('Stop Old Container') {
            steps {
                script {
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"
                }
            }
        }

        stage('Run Container') {
            steps {
                script {
                    sh "docker run -d --name ${CONTAINER_NAME} -p 80:80 ${IMAGE_NAME}"
                }
            }
        }
    }
    
    post {
        success {
            echo "✅ Pipeline completed successfully! Application is running on port 80."
        }
        failure {
            echo "❌ Pipeline failed! Please check the SonarQube Quality Gate or Docker build logs."
        }
    }
}
