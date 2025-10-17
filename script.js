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


let courses = [];

// 添加课程行
document.getElementById('addCourseBtn').addEventListener('click', function() {
    const tbody = document.getElementById('courseTableBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" class="course-name" placeholder="课程名称"></td>
        <td><input type="number" class="course-credit" placeholder="学分" min="0" step="0.5"></td>
        <td><input type="text" class="course-grade" placeholder="成绩/等级"></td>
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
    
    newRow.querySelector('.delete-course').addEventListener('click', function() {
        tbody.removeChild(newRow);
    });
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

// 从表格获取课程数据
function getCoursesFromTable() {
    const rows = document.querySelectorAll('#courseTableBody tr');
    const courses = [];
    
    rows.forEach(row => {
        const name = row.querySelector('.course-name').value;
        const credit = parseFloat(row.querySelector('.course-credit').value);
        const grade = row.querySelector('.course-grade').value;
        const type = row.querySelector('.course-type').value;
        
        if (name && !isNaN(credit) && grade) {
            courses.push({ name, credit, grade, type });
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
    
    courses.forEach(course => {
        let gpa;
        
        // 判断输入的是百分制成绩还是等级
        if (!isNaN(course.grade)) {
            gpa = percentToGpa(parseFloat(course.grade));
        } else {
            gpa = gpaConversion[course.grade.toUpperCase()] || 0;
        }
        
        totalGradePoints += course.credit * gpa;
        totalCredits += course.credit;
    });
    
    return {
        gpa: totalCredits > 0 ? totalGradePoints / totalCredits : 0,
        totalCredits,
        totalGradePoints,
        courseCount: courses.length
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
        <p><strong>总学分绩点：</strong> ${result.totalGradePoints.toFixed(2)}</p>
    `;
    
    document.getElementById('resultDisplay').style.display = 'block';
}

// 导出
document.getElementById('exportBtn').addEventListener('click', function() {
    const courses = getCoursesFromTable();
    const result = calculateGPA(courses);
    
    let content = '绩点通 - 成绩单导出\n';
    content += '生成时间: ' + new Date().toLocaleString() + '\n\n';
    content += '课程列表:\n';
    content += '课程名称\t学分\t成绩\t类型\n';
    
    courses.forEach(course => {
        content += `${course.name}\t${course.credit}\t${course.grade}\t${course.type}\n`;
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

// 基础计算器功能
let currentDisplay = '';

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
        
        // 处理浮点数精度问题
        currentDisplay = parseFloat(result.toPrecision(12)).toString();
        updateDisplay();
    } catch (error) {
        currentDisplay = '错误';
        updateDisplay();
    }
}

// 科学计算功能
function calculateSin() {
    const value = parseFloat(prompt('请输入角度:'));
    if (!isNaN(value)) {
        const radians = value * Math.PI / 180;
        currentDisplay = Math.sin(radians).toString();
        updateDisplay();
    }
}

function calculateCos() {
    const value = parseFloat(prompt('请输入角度:'));
    if (!isNaN(value)) {
        const radians = value * Math.PI / 180;
        currentDisplay = Math.cos(radians).toString();
        updateDisplay();
    }
}

function calculateTan() {
    const value = parseFloat(prompt('请输入角度:'));
    if (!isNaN(value)) {
        const radians = value * Math.PI / 180;
        currentDisplay = Math.tan(radians).toString();
        updateDisplay();
    }
}

function calculateLog() {
    const value = parseFloat(prompt('请输入数值:'));
    if (!isNaN(value) && value > 0) {
        currentDisplay = Math.log10(value).toString();
        updateDisplay();
    }
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

document.getElementById('addCourseBtn').click();

// 测试基础计算器精度，以0.7*0.8为例
function testCalculatorPrecision() {
    console.log('测试计算器精度: 0.7 * 0.8 =', 0.7 * 0.8);
    console.log('期望结果: 0.56');
    console.log('实际结果是否准确:', (0.7 * 0.8) === 0.56);
}

// 页面加载完成后运行测试
window.addEventListener('load', function() {
    testCalculatorPrecision();
});