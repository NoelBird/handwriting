import React from 'react'
import ReactDOM from 'react-dom'
import request from 'superagent'

// 상수 정의
const numRows = 28
const numCols = 28
const numPixels = numRows*numCols
const sizeRow = 10
const sizeCol = 10

// 문자 인식 클라이언트의 메인 컴포넌트
class HandWritingApp extends React.Component{
    constructor(props){
        super(props)
        this.canvas = this.ctx = null
        this.state = {
            isDown: false,
            pixels: null,
            label: '?'
        }
    }

    componentDidMount(){
        this.clearPixels()
    }

    //이미지 데이터 지우기
    clearPixels(){
        const p = []
        for(let i =0; i<numPixels;i++) p.push(0)
        this.setState({
            pixels: p,
            label: '?'
        })
    }

    // 컴포넌트가 렌더링된 이후의 처리
    componentDidUpdate(){
        this.drawCanvas()
    }

    // canvas 렌더링 처리
    drawCanvas(){
        if (!this.canvas) return
        if (!this.ctx) this.ctx = this.canvas.getContext('2d')
        this.ctx.clearRect(0, 0, 280, 280)
        // 테두리 렌더링
        this.ctx.strokeStyle = 'silver'
        this.ctx.moveTo(140, 0)
        this.ctx.lineTo(140, 280)
        this.ctx.moveTo(0, 140)
        this.ctx.lineTo(280, 140)
        this.ctx.stroke()

        // 점으로 숫자 그리기
        this.ctx.fillStyle = 'blue'
        for (let y =0;y<28;y++){
            for(let x=0;x<28;x++){
                const p = this.state.pixels[y*numRows + x]
                if(p === 0) continue
                const xx = x*sizeCol
                const yy = y *sizeRow
                this.ctx.fillRect(xx, yy, sizeCol, sizeRow)
            }
        }
    }

    // 마우스 처리
    doMouseDown(e){
        e.preventDefault()
        this.setState({isDown: true})
    }

    doMouseUp(e){
        e.preventDefault()
        this.setState({isDown: false})
        this.predictLabel()
    }

    doMouseMove(e){
        e.preventDefault()
        if (!this.state.isDown) return
        const eve = e.nativeEvent
        const b = e.target.getBoundingClientRect()
        const rx = eve.clientX - b.left
        const ry = eve.clientY - b.top
        const x = Math.floor(rx / sizeCol)
        const y = Math.floor(ry / sizeRow)
        const pixels = this.state.pixels
        pixels[y*numRows + x] = 0xF
        this.setState({pixels})
    }

    // 문자 인식 API 호출
    predictLabel(){
        const px = this.state.pixels.map(
            v => v.toString(16)).join(' ')
        request
        .get('http://localhost:3002/api/predict')
        .query({px})
        .end((err, res) => {
            if(err) return
            if (res.body.status) {
                this.setState({label: res.body.label})
            }
        })
    }

    // 렌더링 처리
    render(){
        return (
            <div>
                <canvas ref={(e) => {this.canvas = e}}
                width={280} height={280}
                onMouseDown = {e => this.doMouseDown(e)}
                onMouseMove = {e => this.doMouseMove(e)}
                onMouseUp = {e => this.doMouseUp(e)}
                // onMouseOut = {e => this.doMouseUp(e)}
                />
                <p>예측: {this.state.label}</p>
                <button onClick={e => this.clearPixels()}>지우기</button>
            </div>
        )
    }
}

// DOM의 내용을 메인 컴포넌트로 변경합니다.
ReactDOM.render(
    <HandWritingApp />,
    document.getElementById('root')
)
