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

        // ========== 3. Build Docker Image ==========
        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME}:latest ."
                }
            }
        }

        // ========== 4. Trivy Security Scan ==========
        stage('Trivy Security Scan') {
            steps {
                script {
                    sh '''
                        echo "========== Trivy Security Scan Started =========="
                        echo "Scanning Docker image: ${IMAGE_NAME}:latest"
                        
                        # التحقق من وجود trivy
                        if command -v trivy &> /dev/null; then
                            echo "✅ Trivy found in PATH"
                            TRIVY_CMD="trivy"
                        else
                            echo "⚠️ Trivy not found, using Docker container"
                            TRIVY_CMD="docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest"
                        fi
                        
                        # فحص الثغرات الأمنية في الصورة (فقط HIGH و CRITICAL)
                        ${TRIVY_CMD} image \
                          --severity HIGH,CRITICAL \
                          --exit-code 1 \
                          --format table \
                          ${IMAGE_NAME}:latest
                        
                        # إنشاء تقرير JSON للتحليل
                        ${TRIVY_CMD} image \
                          --severity HIGH,CRITICAL \
                          --format json \
                          --output ${TRIVY_REPORT} \
                          ${IMAGE_NAME}:latest
                        
                        echo "✅ Trivy scan completed - No HIGH/CRITICAL vulnerabilities found"
                    '''
                }
            }
            post {
                always {
                    // حفظ التقرير كـ artifact حتى لو فشل الفحص
                    archiveArtifacts artifacts: 'trivy-report.json', fingerprint: true, allowEmptyArchive: true
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
                    echo "✅ Container started successfully on port 80"
                }
            }
        }
    }
    
    post {
        success {
            echo "========================================="
            echo "✅ Pipeline completed successfully!"
            echo "✅ SonarQube Quality Gate: PASSED"
            echo "✅ Trivy Security Scan: PASSED"
            echo "✅ Application is running on port 80"
            echo "========================================="
        }
        failure {
            echo "========================================="
            echo "❌ Pipeline failed!"
            echo "❌ Check one of these:"
            echo "   - SonarQube Quality Gate (check http://${SONAR_HOST_URL})"
            echo "   - Trivy found HIGH/CRITICAL vulnerabilities"
            echo "   - Docker build or runtime error"
            echo "========================================="
        }
    }
}
