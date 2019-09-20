const fs = require('fs')
const path = require('path')
const SVM = require('libsvm-js/asm')

// CSV 파일 읽어 들이기
const [data, label] = loadCSV('image-train.csv')

// svm으로 데이터 학습시키기
const svm = new SVM({type: SVM.SVM_TYPES.C_SVC})
svm.train(data, label)

// console.log(testdata[0])
fs.writeFileSync(path.join(__dirname, 'database', 'image-model.svm'), // model 저장
svm.serializeModel(), 'utf-8')
svm.free()

function loadCSV(fname){
    const csv = fs.readFileSync(fname, 'utf-8')
    const lines = csv.split('\n')
    var a = []
    var b = []
    lines.forEach(d =>{
        const cells = d.split(',')
        const x = cells.map(v => parseInt(v))
        const label = x.shift()
        a.push(x)
        b.push(label)
    })
    return [a, b]
}