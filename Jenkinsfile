pipeline {
    agent any

    environment {
        IMAGE_NAME = "ynov-project-image"
        CONTAINER_NAME = "ynov-project-container"
        SONAR_HOST_URL = "http://192.168.142.143:9000"
        SONAR_TOKEN = credentials('sonarqube-token')
    }

    stages {
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/BHerradi-IT/YNOV-PROJECT.git'
            }
        }

        // ========== مرحلة SonarQube باستخدام Docker ==========
        stage('SonarQube Analysis') {
            steps {
                script {
                    sh '''
                        echo "========== SonarQube Analysis Started =========="
                        echo "Checking frontend/src directory..."
                        ls -la frontend/src/ || echo "frontend/src not found!"
                        
                        # استخدام Docker لتشغيل sonar-scanner
                        docker run --rm \
                          -v $(pwd):/usr/src \
                          -w /usr/src \
                          sonarsource/sonar-scanner-cli:latest \
                          sonar-scanner \
                          -Dsonar.projectKey=ynov-react-app \
                          -Dsonar.projectName="YNOV React App" \
                          -Dsonar.projectVersion=1.0 \
                          -Dsonar.sources=frontend/src \
                          -Dsonar.exclusions=**/node_modules/**,**/*.test.js \
                          -Dsonar.host.url=${SONAR_HOST_URL} \
                          -Dsonar.login=${SONAR_TOKEN}
                    '''
                }
            }
        }

        // ========== مرحلة فحص الجودة ==========
        stage('Quality Gate Check') {
            steps {
                script {
                    echo "Waiting for SonarQube analysis to complete..."
                    sleep(time: 30, unit: 'SECONDS')
                    
                    // التحقق من نتيجة الجودة
                    sh '''
                        STATUS=$(curl -s -u ${SONAR_TOKEN}: "${SONAR_HOST_URL}/api/qualitygates/project_status?projectKey=ynov-react-app" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
                        echo "Quality Gate Status: ${STATUS}"
                        
                        if [ "$STATUS" = "ERROR" ]; then
                            echo "❌ Quality Gate failed! Please check SonarQube for details."
                            exit 1
                        elif [ "$STATUS" = "OK" ]; then
                            echo "✅ Quality Gate passed!"
                        else
                            echo "⚠️ Quality Gate status unknown: ${STATUS}"
                        fi
                    '''
                }
            }
        }

        // ========== بناء Docker ==========
        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME} ."
                }
            }
        }

        // ========== إيقاف الحاوية القديمة ==========
        stage('Stop Old Container') {
            steps {
                script {
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"
                }
            }
        }

        // ========== تشغيل الحاوية الجديدة ==========
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
            echo "✅ Pipeline completed successfully!"
            echo "✅ Application is running on port 80"
        }
        failure {
            echo "❌ Pipeline failed!"
        }
    }
}
