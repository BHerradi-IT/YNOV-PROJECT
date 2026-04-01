pipeline {
    agent any

    environment {
        IMAGE_NAME = "ynov-project-image"
        CONTAINER_NAME = "ynov-project-container"
        SONAR_HOST_URL = "http://192.168.142.143:9000"
        SONAR_TOKEN = credentials('sonar-token')
        
        // Docker Hub Settings
        DOCKER_HUB_USERNAME = "peacechouaib"
        DOCKER_HUB_IMAGE = "ynov-project"
        
        // Email Settings
        EMAIL_RECIPIENT = "herraditech@gmail.com"
    }

    stages {
        // ========== 1. Clone Repository ==========
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/BHerradi-IT/YNOV-PROJECT.git'
            }
        }

        // ========== 2. SonarQube Analysis ==========
        stage('SonarQube Analysis') {
            steps {
                script {
                    sh '''
                        echo "========== SonarQube Analysis Started =========="
                        
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

        // ========== 3. Quality Gate Check ==========
        stage('Quality Gate Check') {
            steps {
                script {
                    echo "Waiting for SonarQube analysis..."
                    sleep(time: 30, unit: 'SECONDS')
                    
                    sh '''
                        STATUS=$(curl -s -u ${SONAR_TOKEN}: "${SONAR_HOST_URL}/api/qualitygates/project_status?projectKey=ynov-react-app" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
                        echo "Quality Gate Status: ${STATUS}"
                        
                        if [ "$STATUS" = "ERROR" ]; then
                            echo "❌ Quality Gate failed!"
                            exit 1
                        else
                            echo "✅ Quality Gate passed!"
                        fi
                    '''
                }
            }
        }

        // ========== 4. Build Docker Image ==========
        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME}:latest ."
                    sh "docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:${BUILD_NUMBER}"
                }
            }
        }

        // ========== 5. Trivy Security Scan ==========
        stage('Trivy Security Scan') {
            steps {
                script {
                    sh '''
                        echo "========== Trivy Security Scan Started =========="
                        
                        mkdir -p reports
                        
                        # فحص الصورة وإنشاء تقرير
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v $(pwd):/src \
                          -w /src \
                          aquasec/trivy:latest \
                          image ${IMAGE_NAME}:latest \
                          --severity HIGH,CRITICAL \
                          --format table \
                          --output reports/trivy-scan.txt
                        
                        # إنشاء تقرير JSON للتفاصيل
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v $(pwd):/src \
                          -w /src \
                          aquasec/trivy:latest \
                          image ${IMAGE_NAME}:latest \
                          --format json \
                          --output reports/trivy-report.json
                        
                        # حساب عدد الثغرات
                        HIGH_COUNT=$(grep -o '"SEVERITY":"HIGH"' reports/trivy-report.json | wc -l || echo "0")
                        CRITICAL_COUNT=$(grep -o '"SEVERITY":"CRITICAL"' reports/trivy-report.json | wc -l || echo "0")
                        
                        echo "========================================="
                        echo "📊 Trivy Scan Summary"
                        echo "========================================="
                        echo "🔴 CRITICAL: $CRITICAL_COUNT"
                        echo "🟠 HIGH: $HIGH_COUNT"
                        echo "========================================="
                        
                        # فشل الـ pipeline إذا وجد ثغرات CRITICAL
                        if [ "$CRITICAL_COUNT" -gt 0 ]; then
                            echo "❌ CRITICAL vulnerabilities found! Failing pipeline."
                            exit 1
                        else
                            echo "✅ No CRITICAL vulnerabilities found"
                        fi
                    '''
                }
            }
            post {
                always {
                    // حفظ التقارير
                    archiveArtifacts artifacts: 'reports/*', fingerprint: true
                }
            }
        }

        // ========== 6. Push to Docker Hub ==========
        stage('Push to Docker Hub') {
            steps {
                script {
                    echo "========== Pushing to Docker Hub =========="
                    
                    withDockerRegistry(credentialsId: 'docker-hub-cred') {
                        sh "docker tag ${IMAGE_NAME}:latest ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:latest"
                        sh "docker tag ${IMAGE_NAME}:latest ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:latest"
                        sh "docker push ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:${BUILD_NUMBER}"
                        
                        echo "✅ Image pushed: ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:${BUILD_NUMBER}"
                    }
                }
            }
        }

        // ========== 7. Stop Old Container ==========
        stage('Stop Old Container') {
            steps {
                script {
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"
                }
            }
        }

        // ========== 8. Run New Container ==========
        stage('Run Container') {
            steps {
                script {
                    sh "docker run -d --name ${CONTAINER_NAME} -p 80:80 ${IMAGE_NAME}:latest"
                    echo "✅ Application running on port 80"
                }
            }
        }
    }
    
    // ========== Post Actions ==========
    post {
        success {
            script {
                // إرسال بريد عند النجاح
                emailext(
                    subject: "✅ Pipeline SUCCESS - ${JOB_NAME} #${BUILD_NUMBER}",
                    body: """
                        Pipeline completed successfully!
                        
                        Build: ${JOB_NAME} #${BUILD_NUMBER}
                        Status: SUCCESS
                        
                        SonarQube: PASSED
                        Trivy Scan: PASSED (No CRITICAL vulnerabilities)
                        Docker Hub: ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:${BUILD_NUMBER}
                        Application: http://localhost:80
                        
                        Build URL: ${BUILD_URL}
                        
                        ---
                        Jenkins Pipeline
                    """,
                    to: "${EMAIL_RECIPIENT}"
                )
                echo "✅ Success email sent to ${EMAIL_RECIPIENT}"
            }
            echo "========================================="
            echo "✅ PIPELINE COMPLETED SUCCESSFULLY!"
            echo "========================================="
        }
        failure {
            script {
                // إرسال بريد عند الفشل
                emailext(
                    subject: "❌ Pipeline FAILED - ${JOB_NAME} #${BUILD_NUMBER}",
                    body: """
                        Pipeline failed!
                        
                        Build: ${JOB_NAME} #${BUILD_NUMBER}
                        Status: FAILED
                        
                        Check Jenkins logs for details:
                        ${BUILD_URL}
                        
                        ---
                        Jenkins Pipeline
                    """,
                    to: "${EMAIL_RECIPIENT}"
                )
                echo "❌ Failure email sent to ${EMAIL_RECIPIENT}"
            }
            echo "========================================="
            echo "❌ PIPELINE FAILED!"
            echo "========================================="
        }
    }
}
