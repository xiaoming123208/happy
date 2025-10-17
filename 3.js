// 绩点转换标准
const gpaConversion = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
};

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


let currentDisplay = '0';
let isRadianMode = false;


document.addEventListener('DOMContentLoaded', function() {
   
    addCourseRow();
    
    // 角度切换
    document.getElementById('angleModeToggle').addEventListener('change', function() {
        isRadianMode = this.checked;
        document.getElementById('currentMode').textContent = 
            `当前模式：${isRadianMode ? '弧度' : '角度'}`;
    });
    
    
    document.getElementById('addCourseBtn').addEventListener('click', addCourseRow);
    document.getElementById('calculateGpaBtn').addEventListener('click', calculateGPA);
    document.getElementById('saveDataBtn').addEventListener('click', saveData);
    document.getElementById('loadDataBtn').addEventListener('click', loadData);
    document.getElementById('mergeDataBtn').addEventListener('click', mergeData);
    document.getElementById('clearDataBtn').addEventListener('click', clearAll);
    document.getElementById('exportBtn').addEventListener('click', exportResult);
    
    
    document.querySelector('.close').addEventListener('click', closeModal);
});

// 绩点计算功能
function addCourseRow() {
    const tbody = document.getElementById('courseTableBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" class="course-name" placeholder="可选填"></td>
        <td><input type="number" class="course-credit" placeholder="学分" min="0" step="0.5" required></td>
        <td><input type="text" class="course-grade" placeholder="成绩" required></td>
        <td><span class="gpa-display">-</span></td>
        <td>
            <select class="course-type">
                <option value="compulsory">必修课</option>
                <option value="major">专业课</option>
                <option value="elective">选修课</option>
            </select>
        </td>
        <td><button class="btn-danger" onclick="this.parentElement.parentElement.remove()">删除</button></td>
    `;
    tbody.appendChild(newRow);
    
    
    const gradeInput = newRow.querySelector('.course-grade');
    const gpaDisplay = newRow.querySelector('.gpa-display');
    
    gradeInput.addEventListener('input', function() {
        const gpa = calculateGpaFromInput(this.value);
        gpaDisplay.textContent = gpa !== null ? gpa.toFixed(1) : '-';
        gpaDisplay.style.color = gpa !== null ? (gpa >= 3.0 ? '#27ae60' : '#e74c3c') : '#95a5a6';
    });
}

function calculateGpaFromInput(grade) {
    if (!grade) return null;
    
    if (!isNaN(grade)) {
        return percentToGpa(parseFloat(grade));
    } else {
        return gpaConversion[grade.toUpperCase()] || null;
    }
}

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

function calculateGPA() {
    const gpaType = document.querySelector('input[name="gpaType"]:checked').value;
    const courses = getCoursesFromTable();
    
    if (courses.length === 0) {
        alert('请至少添加一门有效的课程！');
        return;
    }
    
    const filteredCourses = gpaType === 'all' ? courses : 
                           courses.filter(course => course.type === gpaType);
    
    let totalCredits = 0;
    let totalGradePoints = 0;
    
    filteredCourses.forEach(course => {
        totalGradePoints += course.credit * course.gpa;
        totalCredits += course.credit;
    });
    
    const finalGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    
    displayResult(finalGPA, filteredCourses.length, totalCredits, gpaType);
}

function displayResult(gpa, courseCount, totalCredits, type) {
    const typeNames = {
        'all': '所有课程',
        'compulsory': '必修课',
        'major': '专业课',
        'elective': '选修课'
    };
    
    const resultHTML = `
        <p><strong>计算类型：</strong> ${typeNames[type]}</p>
        <p><strong>课程数量：</strong> ${courseCount} 门</p>
        <p><strong>总学分：</strong> ${totalCredits}</p>
        <p><strong>平均绩点：</strong> 
            <span style="color: #e74c3c; font-size: 1.3em; font-weight: bold;">
                ${gpa.toFixed(2)}
            </span>
        </p>
    `;
    
    document.getElementById('gpaResult').innerHTML = resultHTML;
    document.getElementById('resultDisplay').style.display = 'block';
}


function saveData() {
    const courses = getCoursesFromTable();
    if (courses.length === 0) {
        alert('没有课程数据可保存！');
        return;
    }
    
    const timestamp = new Date().toLocaleString();
    const savedData = {
        id: Date.now(),
        timestamp,
        courses: courses
    };
    
    let savedDatas = JSON.parse(localStorage.getItem('gpaSavedDatas') || '[]');
    savedDatas.push(savedData);
    localStorage.setItem('gpaSavedDatas', JSON.stringify(savedDatas));
    
    alert('数据保存成功！');
}

function loadData() {
    const savedDatas = JSON.parse(localStorage.getItem('gpaSavedDatas') || '[]');
    if (savedDatas.length === 0) {
        alert('没有保存的数据！');
        return;
    }
    
    const modal = document.getElementById('loadModal');
    const listContainer = document.getElementById('modalDataList');
    
    listContainer.innerHTML = savedDatas.map(data => `
        <div class="data-item" style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;" 
             onclick="loadSpecificData(${data.id})">
            <strong>${data.timestamp}</strong><br>
            课程: ${data.courses.length}门
        </div>
    `).join('');
    
    modal.style.display = 'block';
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
                <td><input type="text" class="course-grade" value="${course.grade}" placeholder="成绩" required></td>
                <td><span class="gpa-display">${course.gpa.toFixed(1)}</span></td>
                <td>
                    <select class="course-type">
                        <option value="compulsory" ${course.type === 'compulsory' ? 'selected' : ''}>必修课</option>
                        <option value="major" ${course.type === 'major' ? 'selected' : ''}>专业课</option>
                        <option value="elective" ${course.type === 'elective' ? 'selected' : ''}>选修课</option>
                    </select>
                </td>
                <td><button class="btn-danger" onclick="this.parentElement.parentElement.remove()">删除</button></td>
            `;
            tbody.appendChild(newRow);
            
         
            const gradeInput = newRow.querySelector('.course-grade');
            const gpaDisplay = newRow.querySelector('.gpa-display');
            
            gradeInput.addEventListener('input', function() {
                const gpa = calculateGpaFromInput(this.value);
                gpaDisplay.textContent = gpa !== null ? gpa.toFixed(1) : '-';
            });
        });
        
        closeModal();
        alert('数据加载成功！');
    }
}

function mergeData() {
    alert('合并功能开发中...');
}

function clearAll() {
    if (confirm('确定要清空所有课程数据吗？')) {
        const tbody = document.getElementById('courseTableBody');
        tbody.innerHTML = '';
        document.getElementById('resultDisplay').style.display = 'none';
        addCourseRow();
    }
}

function exportResult() {
    const courses = getCoursesFromTable();
    if (courses.length === 0) {
        alert('没有课程数据可导出！');
        return;
    }
    
    let content = '绩点通 - 成绩单导出\n';
    content += '生成时间: ' + new Date().toLocaleString() + '\n\n';
    content += '课程列表:\n';
    content += '课程名称\t学分\t成绩\t绩点\t类型\n';
    
    courses.forEach(course => {
        content += `${course.name}\t${course.credit}\t${course.grade}\t${course.gpa.toFixed(1)}\t${course.type}\n`;
    });
    
    const result = calculateGPA();
    content += `\n平均绩点: ${result ? result.gpa.toFixed(2) : '未计算'}\n`;
    content += `总学分: ${result ? result.totalCredits : '未计算'}\n`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gpa_report.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function closeModal() {
    document.getElementById('loadModal').style.display = 'none';
}

// 科学计算器功能
function appendToDisplay(value) {
    if (currentDisplay === '0' || currentDisplay === '错误') {
        if (value === '.') {
            currentDisplay = '0.';
        } else {
            currentDisplay = value;
        }
    } else {
        // 处理小数点逻辑
        if (value === '.') {
            
            const lastNumber = getLastNumber();
            if (lastNumber.includes('.')) {
                return; 
            }
        }
        currentDisplay += value;
    }
    updateDisplay();
}

function getLastNumber() {
   
    const operators = ['+', '-', '*', '/', '×'];
    let lastNumber = '';
    
    for (let i = currentDisplay.length - 1; i >= 0; i--) {
        const char = currentDisplay[i];
        if (operators.includes(char)) {
            break;
        }
        lastNumber = char + lastNumber;
    }
    
    return lastNumber || '0';
}

function clearDisplay() {
    currentDisplay = '0';
    updateDisplay();
}

function deleteLast() {
    currentDisplay = currentDisplay.slice(0, -1);
    if (currentDisplay === '') currentDisplay = '0';
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
    if (currentDisplay === '0' || currentDisplay === '错误') {
        currentDisplay = Math.PI.toString();
    } else {
        currentDisplay += Math.PI.toString();
    }
    updateDisplay();
}

function addE() {
    if (currentDisplay === '0' || currentDisplay === '错误') {
        currentDisplay = Math.E.toString();
    } else {
        currentDisplay += Math.E.toString();
    }
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
    const n = parseInt(prompt('请输入 n:'));
    const m = parseInt(prompt('请输入 m:'));
    if (!isNaN(n) && !isNaN(m) && n >= m && m >= 0) {
        const result = factorial(n) / (factorial(m) * factorial(n - m));
        currentDisplay = result.toString();
        updateDisplay();
    }
}

function calculatePermutation() {
    const n = parseInt(prompt('请输入 n:'));
    const m = parseInt(prompt('请输入 m:'));
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