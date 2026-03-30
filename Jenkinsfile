pipeline {
    agent any

    environment {
        IMAGE_NAME = "ynov-project-image"
        CONTAINER_NAME = "ynov-project-container"
        SONAR_HOST_URL = "http://192.168.142.143:9000"
        SONAR_TOKEN = credentials('sonar-token')
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
                    echo "Waiting for SonarQube analysis to complete..."
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
                }
            }
        }

        // ========== 5. Trivy Security Scan + PDF Report ==========
        stage('Trivy Security Scan & PDF Report') {
            steps {
                script {
                    sh '''
                        echo "========== Trivy Security Scan Started =========="
                        
                        # إنشاء مجلد للتقارير
                        mkdir -p reports
                        
                        # 1. فحص الثغرات وإنشاء تقرير JSON
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v $(pwd):/src \
                          -w /src \
                          aquasec/trivy:latest \
                          image ${IMAGE_NAME}:latest \
                          --format json \
                          --output reports/trivy-report.json
                        
                        # 2. إنشاء تقرير HTML (للقراءة)
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v $(pwd):/src \
                          -w /src \
                          aquasec/trivy:latest \
                          image ${IMAGE_NAME}:latest \
                          --format table \
                          --output reports/trivy-report.html
                        
                        # 3. إنشاء تقرير HTML مفصل باستخدام قالب HTML
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v $(pwd):/src \
                          -w /src \
                          aquasec/trivy:latest \
                          image ${IMAGE_NAME}:latest \
                          --format template \
                          --template "@contrib/html.tpl" \
                          --output reports/trivy-detailed-report.html
                        
                        # 4. عرض ملخص النتائج
                        echo ""
                        echo "========== Trivy Scan Summary =========="
                        echo "✅ JSON report: reports/trivy-report.json"
                        echo "✅ HTML report: reports/trivy-report.html"
                        echo "✅ Detailed HTML report: reports/trivy-detailed-report.html"
                        echo "========================================"
                        
                        # 5. التحقق من وجود ثغرات خطيرة (HIGH/CRITICAL)
                        HIGH_COUNT=$(grep -o '"SEVERITY":"HIGH"' reports/trivy-report.json | wc -l || echo "0")
                        CRITICAL_COUNT=$(grep -o '"SEVERITY":"CRITICAL"' reports/trivy-report.json | wc -l || echo "0")
                        
                        echo "🔴 HIGH vulnerabilities found: $HIGH_COUNT"
                        echo "🔴 CRITICAL vulnerabilities found: $CRITICAL_COUNT"
                        
                        if [ "$HIGH_COUNT" -gt 0 ] || [ "$CRITICAL_COUNT" -gt 0 ]; then
                            echo "❌ Pipeline failed due to HIGH/CRITICAL vulnerabilities!"
                            exit 1
                        else
                            echo "✅ No HIGH/CRITICAL vulnerabilities found"
                        fi
                    '''
                }
            }
            post {
                always {
                    // حفظ التقارير كـ artifacts في Jenkins
                    archiveArtifacts artifacts: 'reports/*.json, reports/*.html', fingerprint: true
                }
            }
        }

        // ========== 6. Stop Old Container ==========
        stage('Stop Old Container') {
            steps {
                script {
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"
                }
            }
        }

        // ========== 7. Run New Container ==========
        stage('Run Container') {
            steps {
                script {
                    sh "docker run -d --name ${CONTAINER_NAME} -p 80:80 ${IMAGE_NAME}:latest"
                    echo "✅ Application started successfully on port 80"
                }
            }
        }
    }
    
    // ========== Post Pipeline Actions ==========
    post {
        success {
            echo "========================================="
            echo "✅ PIPELINE COMPLETED SUCCESSFULLY!"
            echo "✅ SonarQube Quality Gate: PASSED"
            echo "✅ Trivy Security Scan: PASSED"
            echo "✅ Application running on port 80"
            echo "✅ Reports saved in Jenkins artifacts"
            echo "========================================="
        }
        failure {
            echo "========================================="
            echo "❌ PIPELINE FAILED!"
            echo "❌ Check the logs above for details"
            echo "❌ Possible reasons:"
            echo "   - SonarQube Quality Gate failed"
            echo "   - Trivy found HIGH/CRITICAL vulnerabilities"
            echo "   - Docker build or runtime error"
            echo "========================================="
            
            // إرسال إشعار بالفشل (اختياري)
            emailext(
                subject: "❌ Pipeline Failed: ${JOB_NAME} - ${BUILD_NUMBER}",
                body: "The pipeline has failed. Check Jenkins for details.\n\nBuild URL: ${BUILD_URL}",
                to: "team@example.com"
            )
        }
    }
}
