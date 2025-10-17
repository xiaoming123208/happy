// 上海财经大学绩点转换标准
const gpaConversion = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
};

// 百分制到绩点转换
function percentToGpa(score) {
    if (score >= 90) return 4.0;
    if (score >= 85) return 3.7;
    if (score >= 82) return 3.3;
    if (score >= 78) return 3.0;
    if (score >= 75) return 2.7;
    if (score >= 72) return 2.3;
    if (score >= 68) return 2.0;
    if (score >= 64) return 1.7;
    if (score >= 60) return 1.0;
    return 0.0;
}

// 绩点对照表数据
const gpaChartData = {
    labels: ['90-100', '85-89', '82-84', '78-81', '75-77', '72-74', '68-71', '64-67', '60-63', '0-59'],
    gradePoints: [4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.0, 0.0],
    grades: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F']
};

// 课程管理和数据存储
let courses = [];
let currentDisplay = '';
let isRadianMode = false;


function initGpaChart() {
    const ctx = document.getElementById('gpaChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: gpaChartData.labels,
            datasets: [{
                label: '绩点',
                data: gpaChartData.gradePoints,
                backgroundColor: [
                    '#2ecc71', '#27ae60', '#3498db', '#2980b9', 
                    '#9b59b6', '#8e44ad', '#f39c12', '#e67e22', 
                    '#e74c3c', '#c0392b', '#7f8c8d'
                ],
                borderColor: '#2c3e50',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 4.0,
                    title: {
                        display: true,
                        text: '绩点'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '成绩区间 / 等级'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            return `成绩: ${gpaChartData.labels[index]}, 等级: ${gpaChartData.grades[index]}, 绩点: ${context.parsed.y}`;
                        }
                    }
                }
            }
        }
    });
}

// 角度弧度切换
document.getElementById('angleModeToggle').addEventListener('change', function() {
    isRadianMode = this.checked;
    document.getElementById('currentMode').textContent = 
        `当前模式: ${isRadianMode ? '弧度' : '角度'}`;
});


document.getElementById('addCourseBtn').addEventListener('click', function() {
    const tbody = document.getElementById('courseTableBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" class="course-name" placeholder="可选填"></td>
        <td><input type="number" class="course-credit" placeholder="学分" min="0" step="0.5" required></td>
        <td><input type="text" class="course-grade" placeholder="成绩/等级" required></td>
        <td><span class="gpa-display">-</span></td>
        <td>
            <select class="course-type">
                <option value="compulsory">必修课</option>
                <option value="major">专业课</option>
                <option value="elective">选修课</option>
            </select>
        </td>
        <td><button class="btn-secondary delete-course">删除</button></td>
    `;
    tbody.appendChild(newRow);
    
    
    const gradeInput = newRow.querySelector('.course-grade');
    const gpaDisplay = newRow.querySelector('.gpa-display');
    
    gradeInput.addEventListener('input', function() {
        const gpa = calculateGpaFromInput(this.value);
        gpaDisplay.textContent = gpa !== null ? gpa.toFixed(1) : '-';
        gpaDisplay.style.color = gpa !== null ? (gpa >= 3.0 ? '#27ae60' : '#e74c3c') : '#95a5a6';
    });
    
    
    newRow.querySelector('.delete-course').addEventListener('click', function() {
        tbody.removeChild(newRow);
    });
});

function calculateGpaFromInput(grade) {
    if (!grade) return null;
    
    // 判断输入的是百分制成绩还是等级
    if (!isNaN(grade)) {

        return percentToGpa(parseFloat(grade));
    } else {
        
        return gpaConversion[grade.toUpperCase()] || null;
    }
}

// 从表格获取课程数据
function getCoursesFromTable() {
    const rows = document.querySelectorAll('#courseTableBody tr');
    const courses = [];
    
    rows.forEach(row => {
        const name = row.querySelector('.course-name').value;
        const credit = parseFloat(row.querySelector('.course-credit').value);
        const grade = row.querySelector('.course-grade').value;
        const type = row.querySelector('.course-type').value;
        const gpa = calculateGpaFromInput(grade);
        
        if (!isNaN(credit) && grade && gpa !== null) {
            courses.push({ 
                name: name || `课程${courses.length + 1}`, 
                credit, 
                grade, 
                gpa,
                type 
            });
        }
    });
    
    return courses;
}

// 根据类型筛选课程
function filterCoursesByType(courses, type) {
    if (type === 'all') return courses;
    return courses.filter(course => course.type === type);
}

// 计算GPA
function calculateGPA(courses) {
    let totalCredits = 0;
    let totalGradePoints = 0;
    let gradeDistribution = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    
    courses.forEach(course => {
        totalGradePoints += course.credit * course.gpa;
        totalCredits += course.credit;
        
        
        if (course.gpa >= 3.7) gradeDistribution.A++;
        else if (course.gpa >= 3.0) gradeDistribution.B++;
        else if (course.gpa >= 2.0) gradeDistribution.C++;
        else if (course.gpa >= 1.0) gradeDistribution.D++;
        else gradeDistribution.F++;
    });
    
    return {
        gpa: totalCredits > 0 ? totalGradePoints / totalCredits : 0,
        totalCredits,
        courseCount: courses.length,
        gradeDistribution
    };
}

// 显示结果
function displayResult(result, type, courses) {
    const resultDiv = document.getElementById('gpaResult');
    const typeNames = {
        'all': '所有课程',
        'compulsory': '必修课',
        'major': '专业课',
        'elective': '选修课'
    };
    
    resultDiv.innerHTML = `
        <h4>${typeNames[type]} GPA计算结果</h4>
        <p><strong>课程数量：</strong> ${result.courseCount} 门</p>
        <p><strong>总学分：</strong> ${result.totalCredits}</p>
        <p><strong>平均绩点：</strong> <span style="color: #e74c3c; font-size: 1.3em;">${result.gpa.toFixed(2)}</span></p>
    `;
    
    
    displayResultChart(result.gradeDistribution);
    
    document.getElementById('resultDisplay').style.display = 'block';
}


function displayResultChart(gradeDistribution) {
    const ctx = document.getElementById('resultChart').getContext('2d');
    
    if (window.resultChartInstance) {
        window.resultChartInstance.destroy();
    }
    
    window.resultChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['优秀 (A, 3.7+)', '良好 (B, 3.0-3.7)', '中等 (C, 2.0-3.0)', '及格 (D, 1.0-2.0)', '不及格 (F, <1.0)'],
            datasets: [{
                data: [
                    gradeDistribution.A,
                    gradeDistribution.B,
                    gradeDistribution.C,
                    gradeDistribution.D,
                    gradeDistribution.F
                ],
                backgroundColor: [
                    '#2ecc71',
                    '#3498db',
                    '#f39c12',
                    '#e67e22',
                    '#e74c3c'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// 数据保存功能
document.getElementById('saveDataBtn').addEventListener('click', function() {
    const courses = getCoursesFromTable();
    if (courses.length === 0) {
        alert('没有课程数据可保存！');
        return;
    }
    
    const timestamp = new Date().toLocaleString();
    const savedData = {
        id: Date.now(),
        timestamp,
        courses: courses,
        summary: calculateGPA(courses)
    };
    
    
    let savedDatas = JSON.parse(localStorage.getItem('gpaSavedDatas') || '[]');
    savedDatas.push(savedData);
    localStorage.setItem('gpaSavedDatas', JSON.stringify(savedDatas));
    
    alert('数据保存成功！');
    updateSavedDataList();
});


function updateSavedDataList() {
    const savedDatas = JSON.parse(localStorage.getItem('gpaSavedDatas') || '[]');
    const listContainer = document.getElementById('savedDataList');
    
    if (savedDatas.length === 0) {
        listContainer.innerHTML = '<p>暂无保存的数据</p>';
        return;
    }
    
    listContainer.innerHTML = savedDatas.map(data => `
        <div class="data-item">
            <div class="data-info">
                <strong>${data.timestamp}</strong>
                <br>课程: ${data.courses.length}门, GPA: ${data.summary.gpa.toFixed(2)}
            </div>
            <div class="data-actions">
                <button onclick="loadSpecificData(${data.id})" class="btn-secondary">加载</button>
                <button onclick="deleteSavedData(${data.id})" class="btn-danger">删除</button>
            </div>
        </div>
    `).join('');
}


function loadSpecificData(id) {
    const savedDatas = JSON.parse(localStorage.getItem('gpaSavedDatas') || '[]');
    const data = savedDatas.find(d => d.id === id);
    
    if (data) {
        
        const tbody = document.getElementById('courseTableBody');
        tbody.innerHTML = '';
        
        
        data.courses.forEach(course => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><input type="text" class="course-name" value="${course.name}" placeholder="可选填"></td>
                <td><input type="number" class="course-credit" value="${course.credit}" placeholder="学分" min="0" step="0.5" required></td>
                <td><input type="text" class="course-grade" value="${course.grade}" placeholder="成绩/等级" required></td>
                <td><span class="gpa-display">${course.gpa.toFixed(1)}</span></td>
                <td>
                    <select class="course-type">
                        <option value="compulsory" ${course.type === 'compulsory' ? 'selected' : ''}>必修课</option>
                        <option value="major" ${course.type === 'major' ? 'selected' : ''}>专业课</option>
                        <option value="elective" ${course.type === 'elective' ? 'selected' : ''}>选修课</option>
                    </select>
                </td>
                <td><button class="btn-secondary delete-course">删除</button></td>
            `;
            tbody.appendChild(newRow);
            
            
            const gradeInput = newRow.querySelector('.course-grade');
            const gpaDisplay = newRow.querySelector('.gpa-display');
            
            gradeInput.addEventListener('input', function() {
                const gpa = calculateGpaFromInput(this.value);
                gpaDisplay.textContent = gpa !== null ? gpa.toFixed(1) : '-';
            });
            
            newRow.querySelector('.delete-course').addEventListener('click', function() {
                tbody.removeChild(newRow);
            });
        });
        
        alert('数据加载成功！');
    }
}


function deleteSavedData(id) {
    if (confirm('确定要删除这个保存的数据吗？')) {
        let savedDatas = JSON.parse(localStorage.getItem('gpaSavedDatas') || '[]');
        savedDatas = savedDatas.filter(d => d.id !== id);
        localStorage.setItem('gpaSavedDatas', JSON.stringify(savedDatas));
        updateSavedDataList();
    }
}


document.getElementById('mergeDataBtn').addEventListener('click', function() {
    const savedDatas = JSON.parse(localStorage.getItem('gpaSavedDatas') || '[]');
    if (savedDatas.length === 0) {
        alert('没有可合并的数据！');
        return;
    }
    
    const modal = document.getElementById('mergeDataModal');
    const listContainer = document.getElementById('mergeDataList');
    
    listContainer.innerHTML = savedDatas.map(data => `
        <label style="display: block; margin: 10px 0;">
            <input type="checkbox" name="mergeData" value="${data.id}">
            ${data.timestamp} (${data.courses.length}门课程, GPA: ${data.summary.gpa.toFixed(2)})
        </label>
    `).join('');
    
    modal.style.display = 'block';
});


document.getElementById('confirmMerge').addEventListener('click', function() {
    const selectedCheckboxes = document.querySelectorAll('input[name="mergeData"]:checked');
    if (selectedCheckboxes.length === 0) {
        alert('请选择要合并的数据！');
        return;
    }
    
    const savedDatas = JSON.parse(localStorage.getItem('gpaSavedDatas') || '[]');
    let allCourses = getCoursesFromTable(); 
    
    selectedCheckboxes.forEach(checkbox => {
        const dataId = parseInt(checkbox.value);
        const data = savedDatas.find(d => d.id === dataId);
        if (data) {
            allCourses = allCourses.concat(data.courses);
        }
    });
    
    
    const uniqueCourses = [];
    const courseMap = new Map();
    
    allCourses.forEach(course => {
        const key = `${course.name}-${course.grade}-${course.credit}`;
        if (!courseMap.has(key)) {
            courseMap.set(key, true);
            uniqueCourses.push(course);
        }
    });
    
    
    const tbody = document.getElementById('courseTableBody');
    tbody.innerHTML = '';
    
    uniqueCourses.forEach(course => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" class="course-name" value="${course.name}" placeholder="可选填"></td>
            <td><input type="number" class="course-credit" value="${course.credit}" placeholder="学分" min="0" step="0.5" required></td>
            <td><input type="text" class="course-grade" value="${course.grade}" placeholder="成绩/等级" required></td>
            <td><span class="gpa-display">${course.gpa.toFixed(1)}</span></td>
            <td>
                <select class="course-type">
                    <option value="compulsory" ${course.type === 'compulsory' ? 'selected' : ''}>必修课</option>
                    <option value="major" ${course.type === 'major' ? 'selected' : ''}>专业课</option>
                    <option value="elective" ${course.type === 'elective' ? 'selected' : ''}>选修课</option>
                </select>
            </td>
            <td><button class="btn-secondary delete-course">删除</button></td>
        `;
        tbody.appendChild(newRow);
        
        
        const gradeInput = newRow.querySelector('.course-grade');
        const gpaDisplay = newRow.querySelector('.gpa-display');
        
        gradeInput.addEventListener('input', function() {
            const gpa = calculateGpaFromInput(this.value);
            gpaDisplay.textContent = gpa !== null ? gpa.toFixed(1) : '-';
        });
        
        newRow.querySelector('.delete-course').addEventListener('click', function() {
            tbody.removeChild(newRow);
        });
    });
    
    document.getElementById('mergeDataModal').style.display = 'none';
    alert(`合并完成！共 ${uniqueCourses.length} 门课程。`);
});


document.getElementById('clearDataBtn').addEventListener('click', function() {
    if (confirm('确定要清空所有课程数据吗？')) {
        const tbody = document.getElementById('courseTableBody');
        tbody.innerHTML = '';
        document.getElementById('resultDisplay').style.display = 'none';
        
        document.getElementById('addCourseBtn').click();
    }
});


document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});


window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});


function calculateLog() {
    const base = parseFloat(prompt('请输入底数 m:'));
    if (isNaN(base) || base <= 0 || base === 1) {
        alert('底数必须大于0且不等于1！');
        return;
    }
    
    const number = parseFloat(prompt('请输入真数 n:'));
    if (isNaN(number) || number <= 0) {
        alert('真数必须大于0！');
        return;
    }
    
    const result = Math.log(number) / Math.log(base);
    currentDisplay = result.toString();
    updateDisplay();
}


function calculateSin() {
    const value = parseFloat(prompt(`请输入${isRadianMode ? '弧度值' : '角度值'}:`));
    if (!isNaN(value)) {
        const radians = isRadianMode ? value : value * Math.PI / 180;
        currentDisplay = Math.sin(radians).toString();
        updateDisplay();
    }
}

function calculateCos() {
    const value = parseFloat(prompt(`请输入${isRadianMode ? '弧度值' : '角度值'}:`));
    if (!isNaN(value)) {
        const radians = isRadianMode ? value : value * Math.PI / 180;
        currentDisplay = Math.cos(radians).toString();
        updateDisplay();
    }
}

function calculateTan() {
    const value = parseFloat(prompt(`请输入${isRadianMode ? '弧度值' : '角度值'}:`));
    if (!isNaN(value)) {
        const radians = isRadianMode ? value : value * Math.PI / 180;
        currentDisplay = Math.tan(radians).toString();
        updateDisplay();
    }
}

// 基础计算器
function appendToDisplay(value) {
    currentDisplay += value;
    updateDisplay();
}

function clearDisplay() {
    currentDisplay = '';
    updateDisplay();
}

function deleteLast() {
    currentDisplay = currentDisplay.slice(0, -1);
    updateDisplay();
}

function updateDisplay() {
    document.getElementById('calcDisplay').value = currentDisplay;
}

function calculate() {
    try {
        let expression = currentDisplay.replace(/×/g, '*');
        const result = new Function('return ' + expression)();
        currentDisplay = parseFloat(result.toPrecision(12)).toString();
        updateDisplay();
    } catch (error) {
        currentDisplay = '错误';
        updateDisplay();
    }
}

// 科学计算函数
function calculateLn() {
    const value = parseFloat(prompt('请输入数值:'));
    if (!isNaN(value) && value > 0) {
        currentDisplay = Math.log(value).toString();
        updateDisplay();
    }
}

function calculatePower() {
    const base = parseFloat(prompt('请输入底数:'));
    const exponent = parseFloat(prompt('请输入指数:'));
    if (!isNaN(base) && !isNaN(exponent)) {
        currentDisplay = Math.pow(base, exponent).toString();
        updateDisplay();
    }
}

function calculateSqrt() {
    const value = parseFloat(prompt('请输入数值:'));
    if (!isNaN(value) && value >= 0) {
        currentDisplay = Math.sqrt(value).toString();
        updateDisplay();
    }
}

function calculateFactorial() {
    const value = parseInt(prompt('请输入整数:'));
    if (!isNaN(value) && value >= 0) {
        let result = 1;
        for (let i = 2; i <= value; i++) {
            result *= i;
        }
        currentDisplay = result.toString();
        updateDisplay();
    }
}

function addPi() {
    currentDisplay += Math.PI.toString();
    updateDisplay();
}

function addE() {
    currentDisplay += Math.E.toString();
    updateDisplay();
}

function calculateSquare() {
    const value = parseFloat(prompt('请输入数值:'));
    if (!isNaN(value)) {
        currentDisplay = (value * value).toString();
        updateDisplay();
    }
}

function calculateCube() {
    const value = parseFloat(prompt('请输入数值:'));
    if (!isNaN(value)) {
        currentDisplay = (value * value * value).toString();
        updateDisplay();
    }
}

function calculateCombination() {
    const n = parseInt(prompt('请输入n:'));
    const m = parseInt(prompt('请输入m:'));
    if (!isNaN(n) && !isNaN(m) && n >= m && m >= 0) {
        const result = factorial(n) / (factorial(m) * factorial(n - m));
        currentDisplay = result.toString();
        updateDisplay();
    }
}

function calculatePermutation() {
    const n = parseInt(prompt('请输入n:'));
    const m = parseInt(prompt('请输入m:'));
    if (!isNaN(n) && !isNaN(m) && n >= m && m >= 0) {
        const result = factorial(n) / factorial(n - m);
        currentDisplay = result.toString();
        updateDisplay();
    }
}

function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}


window.addEventListener('load', function() {
    initGpaChart();
    updateSavedDataList();
    
    document.getElementById('addCourseBtn').click();
});

// 计算GPA
document.getElementById('calculateGpaBtn').addEventListener('click', function() {
    const gpaType = document.querySelector('input[name="gpaType"]:checked').value;
    const courses = getCoursesFromTable();
    
    if (courses.length === 0) {
        alert('请至少添加一门课程！');
        return;
    }
    
    const filteredCourses = filterCoursesByType(courses, gpaType);
    const result = calculateGPA(filteredCourses);
    
    displayResult(result, gpaType, filteredCourses);
});

// 导出
document.getElementById('exportBtn').addEventListener('click', function() {
    const courses = getCoursesFromTable();
    const result = calculateGPA(courses);
    
    let content = '绩点通 - 成绩单导出\n';
    content += '生成时间: ' + new Date().toLocaleString() + '\n\n';
    content += '课程列表:\n';
    content += '课程名称\t学分\t成绩\t绩点\t类型\n';
    
    courses.forEach(course => {
        content += `${course.name}\t${course.credit}\t${course.grade}\t${course.gpa.toFixed(1)}\t${course.type}\n`;
    });
    
    content += `\n总GPA: ${result.gpa.toFixed(2)}\n`;
    content += `总学分: ${result.totalCredits}\n`;
    content += `课程数量: ${result.courseCount}\n`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gpa_report.txt';
    a.click();
    URL.revokeObjectURL(url);
});