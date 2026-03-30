pipeline {
    agent any

    environment {
        IMAGE_NAME = "ynov-project-image"
        CONTAINER_NAME = "ynov-project-container"
        SONAR_HOST_URL = "http://192.168.142.143:9000"
        SONAR_TOKEN = credentials('sonar-token')
        TRIVY_REPORT = "trivy-report.json"
    }

    stages {
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/BHerradi-IT/YNOV-PROJECT.git'
            }
        }

        // ========== 1. SonarQube Analysis ==========
        stage('SonarQube Analysis') {
            steps {
                script {
                    sh '''
                        echo "========== SonarQube Analysis Started =========="
                        echo "Checking frontend/src directory..."
                        ls -la frontend/src/ || echo "frontend/src not found!"
                        
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
                        
                        echo "✅ SonarQube analysis completed"
                    '''
                }
            }
        }

        // ========== 2. Wait for Quality Gate ==========
        stage('Quality Gate Check') {
            steps {
                script {
                    echo "Waiting for SonarQube analysis to complete..."
                    sleep(time: 30, unit: 'SECONDS')
                    
                    sh '''
                        STATUS=$(curl -s -u ${SONAR_TOKEN}: "${SONAR_HOST_URL}/api/qualitygates/project_status?projectKey=ynov-react-app" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
                        echo "Quality Gate Status: ${STATUS}"
                        
                        if [ "$STATUS" = "ERROR" ]; then
                            echo "❌ Quality Gate failed!"
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

        // ========== 3. Build Docker Image ==========
        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME}:latest ."
                }
            }
        }

        // ========== 4. Trivy Security Scan (باستخدام Grype كبديل مؤقت) ==========
        stage('Security Scan') {
            steps {
                script {
                    sh '''
                        echo "========== Security Scan Started =========="
                        echo "Using Grype as an alternative to Trivy"
                        
                        # سحب صورة Grype (بديل جيد لـ Trivy)
                        docker pull anchore/grype:latest
                        
                        # فحص الصورة
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          anchore/grype:latest \
                          ${IMAGE_NAME}:latest \
                          --fail-on high \
                          --scope AllLayers
                        
                        echo "✅ Security scan completed"
                    '''
                }
            }
        }

        // ========== 5. Stop Old Container ==========
        stage('Stop Old Container') {
            steps {
                script {
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"
                }
            }
        }

        // ========== 6. Run New Container ==========
        stage('Run Container') {
            steps {
                script {
                    sh "docker run -d --name ${CONTAINER_NAME} -p 80:80 ${IMAGE_NAME}:latest"
                    echo "✅ Container started on port 80"
                }
            }
        }
    }
    
    post {
        success {
            echo "========================================="
            echo "✅ Pipeline completed successfully!"
            echo "========================================="
        }
        failure {
            echo "========================================="
            echo "❌ Pipeline failed!"
            echo "========================================="
        }
    }
}
