const fs = require('fs')
const path = require('path')
const SVM = require('libsvm-js/asm')

// 학습된 데이터 읽어 들이기
const data = fs.readFileSync(path.join(__dirname, 'database', 'image-model.svm'), 'utf-8')
const svm = SVM.load(data)

const [testData, testLabel] = loadCSV('image-test.csv')
// 테스트해서 오류 비율 구하기
let count = 0
let ng = 0
for(let i=0;i<testLabel.length;i++){
    const x = testData[i]
    const label = testLabel[i]
    const pre = svm.predictOne(x)
    if(label !== pre){
        ng++
        console.log('ng=', label, pre)
    }
    count++
}
console.log('오류 비율 =', (ng/count)*100)

svm.free()

// CSV파일 읽어 들이기
function loadCSV(fname){
    const csv = fs.readFileSync(fname, 'utf-8')
    const lines = csv.split('\n')
    var a = []
    var b = []
    lines.forEach(line => {
        const cells = line.split(',')
        const x = cells.map(v => parseInt(v))
        const label = x.shift()
        a.push(x)
        b.push(label)
    })
    return [a, b]
}