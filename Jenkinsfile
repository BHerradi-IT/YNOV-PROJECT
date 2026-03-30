pipeline {
    agent any

    environment {
        IMAGE_NAME = "ynov-project-image"
        CONTAINER_NAME = "ynov-project-container"
        
        // إعدادات SonarQube
        SONAR_HOST_URL = "http://192.168.142.143:9000"  // غيّر هذا إلى IP السيرفر
        SONAR_AUTH_TOKEN = credentials('sonarqube-token')  // سنضيفه في Jenkins
    }

    stages {
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/BHerradi-IT/YNOV-PROJECT.git'
            }
        }

        // ========== مرحلة SonarQube الجديدة ==========
        stage('SonarQube Analysis') {
            steps {
                script {
                    // التحقق من وجود الملفات قبل التحليل
                    sh '''
                        echo "========== SonarQube Analysis Started =========="
                        echo "Checking frontend/src directory..."
                        ls -la frontend/src/ || echo "frontend/src not found!"
                    '''
                    
                    // تنفيذ تحليل SonarQube
                    withSonarQubeEnv('SonarQube-Server') {
                        sh '''
                            sonar-scanner \
                            -Dsonar.projectKey=ynov-react-app \
                            -Dsonar.projectName="YNOV React App" \
                            -Dsonar.projectVersion=1.0 \
                            -Dsonar.sources=frontend/src \
                            -Dsonar.exclusions=**/node_modules/**,**/*.test.js \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.login=${SONAR_AUTH_TOKEN}
                        '''
                    }
                }
            }
        }

        // ========== مرحلة التحقق من جودة الكود ==========
        stage('Quality Gate Check') {
            steps {
                script {
                    // انتظار نتيجة SonarQube (مهلة 5 دقائق)
                    timeout(time: 5, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }

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
    
    // ========== ما بعد التنفيذ ==========
    post {
        success {
            echo "✅ Pipeline completed successfully!"
            echo "✅ SonarQube analysis passed!"
            echo "✅ Application is running on port 80"
        }
        failure {
            echo "❌ Pipeline failed!"
            echo "❌ Check SonarQube Quality Gate or Docker build errors"
        }
    }
}
