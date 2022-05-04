

import Chart from './Chart.js'

d3.select('body').append('div').style('display', 'none').attr('position', 'absolute').attr('class', 'd3-tip')

class BarChart extends Chart {
    constructor(id, data) {
        super(id, data)
        this.margin = { left: 40, right: 20, top: 80, bottom: 40 };

        this.innerW = this.width - this.margin.left - this.margin.right;
        this.innerH = this.height - this.margin.top - this.margin.bottom;
        this.y_field1 = "Operating income(RMB)"
        this.y_field2 = "Gross profit(RMB)"
        super.add_svg();
        super.update_chart()
    }
    add_axis() {

    }
    add_scale() {
        this.color = ['#8bc2d8', '#e89995']
        let max = d3.max(this.data, d => parseInt(d[this.y_field1].replaceAll(',', '')))
        this.y = d3.scaleLinear().domain([0, max]).range([this.innerH, 0])
        this.years = d3.groups(this.data, d => d.Year)
        this.x = d3.scaleBand().domain(this.years.map(d => d[0])).range([0, this.innerW])
    }
    update_data() {
    }

    draw_chart() {


        const getNumber = (d, field) => parseInt(d[1][0][field].replaceAll(',', ''))

        let g = this.ChartArea.selectAll('.bar_g').data(this.years).join('g')
            .attr('transform', d => `translate(${this.x(d[0])}, 0 )`)

        // add  year
        g.append('text').attr('x', this.x.bandwidth() / 2).attr('y', 40).text(d => d[0]).attr('fill', 'white')
        // add bar
        g.append('rect')
            .attr('x', 10)
            .attr('y', d => this.y(parseInt(d[1][0][this.y_field1].replaceAll(',', ''))))
            .attr('width', this.x.bandwidth() / 3)
            .attr('height', d => this.innerH - this.y(parseInt(d[1][0][this.y_field1].replaceAll(',', ''))))
            .attr('fill', '#8bc2d8')

        g.append('rect')
            .attr('x', this.x.bandwidth() / 2 + 10)
            .attr('y', d => this.y(parseInt(d[1][0][this.y_field2].replaceAll(',', ''))))
            .attr('width', this.x.bandwidth() / 3)
            .attr('height', d => this.innerH - this.y(parseInt(d[1][0][this.y_field2].replaceAll(',', ''))))
            .attr('fill', '#e89995')


        g.append('text')
            .attr('x', 10)
            .attr('y', d => this.y(parseInt(d[1][0][this.y_field1].replaceAll(',', ''))) - 10)
            .text(d => d3.format('.2s')(getNumber(d, this.y_field1)))
            .attr('fill', 'white')

        g.append('text')
            .attr('x', this.x.bandwidth() / 2 + 10)
            .attr('y', d => this.y(getNumber(d, this.y_field2)) - 10)
            .text(d => d3.format('.2s')(getNumber(d, this.y_field2)))
            .attr('fill', 'white')


        // add title
        this.svg.selectAll(".title").data([0]).join("text").attr('class', 'title')
            .attr("transform", `translate(${this.innerW / 3},${30})`)
            .text("Revenue and Profit in Ratail Market")
            .attr('fill', 'white')
            .style('font-size', '1.2rem')

    }


}
class StackBar extends Chart {
    constructor(id, data) {
        super(id, data);
        this.x_field = "Year";
        this.y_field = "Google_Trend";
        super.add_svg();
        super.update_chart();
        this.add_legends();
    }

    add_scale() {
        let names = this.vis_data.map((d) => d[this.x_field]);
        this.x = d3.scaleBand().domain(names).range([0, this.innerW]).padding(0.2);

        let maxs = d3.max(this.vis_data, (d) => +d[this.y_field]);
        this.y = d3.scaleLinear().domain([0, maxs]).range([this.innerH, 0]);
        this.keys = ['Google_Trend', 'Baidu_Blind_Box', 'Baidu_Popmart', 'Bilibili']
        this.color = d3.scaleOrdinal().domain(this.keys).range(['#326D50', '#418E68', '#66AF60', '#BBECB7']);

    }
    update_data() {
        // stack
        this.vis_data = this.data

    }

    draw_chart() {

        this.AxisX.selectAll('text')
            .attr('transform', 'translate(-25,10)  rotate(-90)')
            .attr('dominant-baseline', 'Hanging')
            .attr('text-anchor', 'end')

        let rects = this.ChartArea.selectAll("rect")
            .data(this.vis_data)
            .join("rect")
        rects.attr("class", "bar") //设置一个类名,方便后续调用

            .attr("x", (d) => this.x(d[this.x_field]))
            .attr("y", (d) => this.y(d[this.y_field]))

            .attr("width", this.x.bandwidth())
            .transition()
            .ease(d3.easeCircleIn)
            .duration(1500)
            .attr("height", (d) => this.innerH - this.y(d[this.y_field]))

            .attr("stroke-width", "0.25")
            .attr("fill", this.color(this.y_field))
        rects.on('mouseover', (e, d) => {
            let html = ` <p> ${this.y_field} :${d[this.y_field]}  </p>`
            this.tips_show(e, d, html)
        })
            .on('mouseout', this.tips_hide)

    }




    add_legends() {
        let g = this.svg
            .append("g")
            .attr("transform", `translate(${10},${-40})`);



        g.selectAll('text').data(this.keys).join('text').attr("x", 70)
            .attr("y", (d, i) => 95 + i * 30)
            .text(d => d);

        let rects = g.selectAll('rect').data(this.keys).join('rect')
        rects.attr("x", 40)
            .attr("y", (d, i) => 80 + i * 30)
            .attr("width", 20)
            .attr("height", 20)
            .attr("stroke", d => this.color(d))
            .attr("fill", d => this.color(d));





        rects.on('click', (e, d) => {
            // 动画更新到新的位置
            this.y_field = d
            this.add_scale()
            this.add_axis()
            d3.selectAll('.bar')
                .transition()
                .ease(d3.easeCircleIn)
                .duration(1500)
                .attr("x", (d) => this.x(d[this.x_field]))
                .attr("y", (d) => this.y(d[this.y_field]))
                .attr("width", this.x.bandwidth())
                .attr("height", (d) => this.innerH - this.y(d[this.y_field]))
                .attr("stroke-width", "0.25")
                .attr("fill", this.color(this.y_field))
        })




    }

}

class Bar extends Chart {
    constructor(id, data) {
        super(id, data)
        this.margin = { left: 140, right: 20, top: 80, bottom: 40 };

        super.add_svg();
        this.innerW = this.width - this.margin.left - this.margin.right;
        this.innerH = this.height - this.margin.top - this.margin.bottom;
        this.x_field = "Year"
        this.y_field = "Operating_income"
        super.update_chart()
        this.AxisY.transition().delay(200).call(d3.axisLeft(this.y).tickFormat(d3.format(".1s")))
        this.add_legends()
        this.ChartArea.selectAll(".y_label").data([0]).join("text").attr('class', 'y_label')
            .attr("transform", `rotate(90)`)
            .text("RMB");
    }

    add_scale() {
        this.x = d3.scaleBand().range([0, this.innerW]).domain(this.data.map(d => d[this.x_field]))
        this.y = d3.scaleLinear().range([this.innerH, 0]).domain([0, d3.max(this.data, d => +d[this.y_field])])
        this.color = d3.scaleOrdinal().domain(this.keys).range(['#598DA4', '#68A3BC', '#79B0C7', '#B0E4FA']);
    }
    update_data() {
        let arr = Object.keys(this.data[0]).filter(d => d !== this.x_field)
        this.keys = arr
    }

    draw_chart() {
        let g = this.ChartArea.selectAll('.myg').data(this.data).join('g').attr('class', 'myg')
            .attr('transform', d => `translate(${this.x(d[this.x_field])},0)`)

        let arr = Object.keys(this.data[0]).filter(d => d !== this.x_field)
        this.keys = arr
        this.x1 = d3.scaleBand().range([0, this.x.bandwidth()]).domain(arr).padding(0.2)
        let rects = g.selectAll('rect').data(d => Object.entries(d).filter(v => v[0] !== this.x_field)).join('rect')
        rects.attr('width', this.x1.bandwidth())
            .attr('height', d => this.innerH - this.y(+d[1]))
            .attr('x', d => this.x1(d[0]))
            .attr('y', d => this.y(+d[1]))
            .attr('fill', d => this.color(d[0]))

    }
    add_legends() {

        let g = this.svg
            .append("g")
            .attr("transform", `translate(${10},${-20})`);



        g.selectAll('text').data(this.keys).join('text').attr("x", 70)
            .attr("y", (d, i) => 95 + i * 30)
            .text(d => d);

        let rects = g.selectAll('rect').data(this.keys).join('rect')
        rects.attr("x", 40)
            .attr("y", (d, i) => 80 + i * 30)
            .attr("width", 20)
            .attr("height", 20)
            .attr("stroke", d => this.color(d))
            .attr("fill", d => this.color(d));







    }

}





async function drawBar2020() {
    const data = await d3.csv('./data/popmart.csv')

    new Bar('svgBox2020', data)

}
async function drawBar2021() {
    const stackData = await d3.csv('./data/trend.csv')
    new StackBar('svgBox2021', stackData)

}


// 点击2019显示趋势
d3.select('#y2019').on('click', () => {

    clearDiv()
    // 设置宽度

    d3.select('#page4').transition().duration(1000).ease(d3.easeBack).style('grid-template-columns', '10% 10% 10% 50% 10% 10%')

    // 填充标题
    let div = d3.select('#y2019')
    page4TrendTitleFormat(div, '#DFB853', ": RETAIL MARKET")

    let text = `    
    <br>Retail Market<br><br>
    Blind boxes are also popular in the second-hand market. According to Xianyu(the biggest second-hand selling market app in China), 300,000 blind box players have successfully traded on Xianyu in 2019. Among them, the most popular Molly dolls have more than 230,000 transactions, with an average price of 270 yuan, and the retail price of these blind boxes is generally between 39 and 69 yuan.

    According to Xinhuanet, the retail market size of trendy toys increased from 6.3 billion yuan in 2015 to 20.7 billion yuan in 2019, with a compound annual growth rate of 34.6%.

    <br>`
    addAnimation(div, text, '2019')

    div.style('background', '#E1D277')

})

// 点击2019显示趋势
d3.select('#y2016').on('click', () => {
    clearDiv()
    // 设置宽度 
    let div = d3.select('#y2016')
    page4TrendTitleFormat(div, '#D78E4A', ": USERS")
    d3.select('#page4').transition().duration(1000).ease(d3.easeBack).style('grid-template-columns', '10% 10% 50% 10% 10% 10%')

    let text = `<br>Users<br><br>
    When toys become the hobby of "adults", they bring cultural and business opportunities and challenges that should not be underestimated. Most of the users who collect blind boxes are women aged 18-24, and most of their jobs are white-collar workers or students.<br><br>`
    addAnimation(div, text, '2016')
    div.style('background', '#E3B46D')
})

d3.select('#y1980').on('click', () => {
    clearDiv()
    d3.select('#page4').transition().on("end", console.log("done")).duration(1000).ease(d3.easeBack).style('grid-template-columns', '50% 10% 10% 10% 10% 10%')
    let div = d3.select('#y1980')
    page4TrendTitleFormat(div, '#F08F8A', ": ORIGIN")


    let text = `<br>Origin<br><br>
        The concept of blind boxes originated in Japan in the 1980s. At that time, the "gashapon machine" that emerged was concentrated in the fields of two-dimensional, ACG and other fields. Blind box was originally called “mini figures”, and later called blind box.<br>`
    addAnimation(div, text, '1980')

    div.style('background', '#F9BDBA')
})
d3.select('#y2010').on('click', () => {
    clearDiv()
    d3.select('#page4').transition().on("end", console.log("done")).duration(1000).ease(d3.easeBack)
        .style('grid-template-columns', '10% 50% 10% 10% 10% 10%')
    let div = d3.select('#y2010')
    page4TrendTitleFormat(div, '#9D73B1', ": POPMART")


    let text = `<br>POPMART<br><br>
  Wang Ning, the founder of POP MART, found that the Japanese Sonny Angel series of toys were very popular, 
  with annual sales exceeding 30 million yuan. 
  He founded POP MART, and this business model of the blind box marketing will be implemented in China.<br>
  `

    addAnimation(div, text, '2010')

    div.style('background', '#C7B3D0')

})


d3.select('#y2020').on('click', () => {
    clearDiv()
    d3.select('#page4').transition().duration(1000).ease(d3.easeBack)
        .style('grid-template-columns', '10% 10% 10% 10% 50% 10%')
    let div = d3.select('#y2020')
    page4TrendTitleFormat(div, '#68A3BC', ": SALES REVENUE")



    let text = `<br>Sales Revenue<br><br>
With the continuous popularity of blind boxes, "blind box thinking" has also been applied in more consumption scenarios and categories, and penetrated into various industries such as beauty, food, retail, and cultural and creative industries.
POP MART, as the leading blind box trending player in China, has seen very considerable growth in revenue and profit since 2017, with an annual increase of nearly 200%.
<br>
`
    addAnimation(div, text)
    div.style('background', '#9ABDCC')


    let svgBox = div.selectAll('#svgBox2020').data([0]).join('div')
    svgBox.style('width', '50vw').style('height', '50vh')
    svgBox.attr('id', 'svgBox2020')
    setTimeout(() => drawBar2020(), 1000)
})

d3.select('#y2021').on('click', (e) => {

    if (e.target.nodeName === "DIV") {
        clearDiv()
    }

    d3.select('#page4').transition().duration(1000).ease(d3.easeBack)
        .style('grid-template-columns', '10% 10% 10% 10% 10% 50%')
    let div = d3.select('#y2021')
    page4TrendTitleFormat(div, '#66AF60', ": SOCIAL MEDIA")

    // add image
    // page4_append_image_right_bottom(div, 'p2')

    let text = `<br>Social Media<br><br>
    Within the big splash of blind box made in the market, the term “blind box” is also appearing more and more on different social media platforms, including bilibili, the most well known video sharing website in China, users are uploading more and more unboxing videos of blind box.
    <br>`
    addAnimation(div, text)
    div.style('background', '#9ECC9A')

    let svgBox = div.selectAll('#svgBox2021').data([0]).join('div').attr('id', 'svgBox2021').style('width', '50vw').style('height', '50vh')
    if (e.target.nodeName === "DIV") {

        setTimeout(() => drawBar2021(), 1000)

    }


})
// 清空所有div的内容,保留span
function clearDiv() {
    d3.selectAll('#page4 div').selectAll('*').remove()
}

let popIPdata = [
    {
        name: "Molly",
        content: `Molly figurine, by Kenny Wong, was originally inspired by a young child. She has emerald eyes, a pouting mouth, and cute temperament. The first time Kenny met Molly, she was with a beret hat, an artist apron, a color palette, and brush in her hands. That's how the little figurine artist was born. She is stubborn, adorable, smart, proud, and fun.`
    }
    , {
        name: 'TheMonsters',
        content: `Hong Kong-born artist, Kasing, started to collaborate with How2work to publish Chinese illustra-tion story books and collectible figure series in 2011. In 2015, he created “the Monsters” series’ story and launched the Vinyl figure series of “The Monsters” by How2work.`
    },
    {
        name: 'Dimoo',
        content: `The little boy Dimoo likes to travel in all mysterious dream worlds, because he can meet many friends who grow up together during the journey. The main line of the DIMOO WORLD series created by designer Ayan, with the little boy DIMOO as the protagonist, presents a huge world view with a dreamy beauty, and also interprets the designer's understanding of life.`

    },

    {
        name: 'Skullpanda',
        content: `In 2014, XIONGMIAO founded the art studio "BEIZHAI", and at the end of 2018, she began to create her own series of "SKULLPANDA", and established the art toy studio " LAZYNORTH". SKULLPANDA’s works are filled with recognizable personal charisma.`
    },
    {
        name: 'Pucky',
        content: `Pucky’s name is derived from Shakespeare's elf character, representing a combination of the real and dream worlds. Pucky's creation is like a colorful dream world, endowed with darkness and spirituality. Most of her themes originate from exploring the world of nature.`
    },
    {
        name: 'SatyrRory',
        content: `Seulgie entered the American art toy circle in 2016, she specializes in creating simple and cute creatures. Satyr Rory, based on the half-sheep, half-human god "Satyr" in Greek mythology, was one of Seulgie's subversive creations in 2016.`
    },
    {
        name: 'BOBO&COCO',
        content: `BOBO is an introverted balloon, and COCO will be more active. BOBO and COCO are always together. Although they have different personalities, they are very different. comfortable state. The designer hopes to bring this comfortable and healing state to fans.`
    },
    {
        name: 'Instinctoy',
        content: `In 2005, Hiroto Ohkubo established INSTINCTOY, an original art toy brand. In 2008, INSTINC-TOY became a manufacturer of original toys and began to manufacture and sell original prod-ucts of its own brand, and also began to collaborate with many designers.`
    },
    {
        name: 'COOLABO',
        content: `COOLABO (Coolrain & LABO: COOLABO) is an art toy brand created by toy artist Coolrain and creative director LABO, initially starting with the name of CoolrainLABO in Korean art toy indus-try. In order to collaborate with more emerging artists, the brand name was officially changed to COOLABO in 2021.`
    },
    {
        name: 'KENNETHYOKI',
        title: "KENNETH & YOKI",
        content: `Yoyo Yeung, a new generation artist specializing in illustration and sculpture, graduated from Camberwell College of Art, University of the Arts London, majoring in illustration. Yoyo has a tal-ent for drawing since she was a child, and has a personality that is faithful to her true nature.`
    }
]


let Ipimages = d3.select('#p5images').selectAll('img').data(popIPdata).join('img')

Ipimages.attr('src', d => `./img/${d.name}.png`)
// 点击compony的公司后的zoom in的内容
d3.selectAll('#p5images img').on('click', goto_Image)

function goto_Image(e) {
    let src = e.target.src
    let name = src.split('/').at(-1).split('.').at(-2)
    console.log(src.split('/').at(-1).split('.').at(-2));


    // 跳转到第六页 
    window.scrollTo(0, window.innerHeight * 10)

    let div = d3.select('#companyZoomin')
    // 删除所有
    div.selectAll('*').remove()
    // 添加文本
    let box = div.append('div').attr('class', 'componyZoominBox')
    let imgBox = box.append('div')

    let contentBox = box.append('div')

    contentBox.append('div').html(name).attr('class', 'title').attr('id', 'p6title')
    contentBox.append('div').html(popIPdata.find(d => d.name === name)?.content)
        .attr('class', 'contentText')
        .attr('id', 'p6Content')

    // 添加多个图片
    let multiImgBox = contentBox.append('div').attr('id', 'p6images')

    let imgdiv = multiImgBox.selectAll('div').data(popIPdata).join('div').attr('class', d => `p6${d.name}`)
    imgdiv.append('img').attr('src', d => `./img/${d.name}.png`)//.style('background', 'rgba(79, 79, 79, 0.7)')
    // 添加时间轴
    // let index = popIPdata.findIndex(d => d.name === name)

    // let line = contentBox.append('div').attr('id', 'p6line')
    // line.append('div').attr('id', 'p6redline').style('margin-left', `${index * 10}%`)





    // 添加 图片
    imgBox.append('img')
        .attr('src', src)
        .style('position', 'absolute')
        .style('bottom', 0)
        .style('left', 50)

    // 添加返回的图标
    let leftBox = imgBox.append('div').attr('class', 'imgBox')
    let left = leftBox.append('img')
    left.attr('src', './img/left.png')



    // 滚动到该页面.
    left.on('click', () => {
        // 跳转到第五页 
        window.scrollTo(0, window.innerHeight * 8.2)
    })
    d3.selectAll('#p6images img').on('click', goto_Image)

}



d3.select('#p1imgBox').on('click', () => {
    let height = window.innerHeight
    window.scrollTo(0, height)
})




let p7data = [{
    title: "#1 Curiosity",
    content: `People are full of curiosity and yearning for the unknown. The fun of a
    blind
    box
    is that it's "blind",
    you can't predict what's in the box. It is the randomness of the product itself that casts a
    layer
    of
    mystery on the blind box, arouses the curiosity of consumers, brings freshness and stimulates
    the
    desire
    to buy.`
},
{
    title: "#2 Diderot effect",
    content: `  Blind box marketing also cleverly uses the Diderot effect. The Diderot effect is a common
    "inad-equate effect", that is, when you don't get something, your heart is calm, but once you
    get
    it, you are not satisfied.`
},
{
    title: "#3 Gambler's mentality",
    content: `  Blind boxes are usually sold in series, each with a dozen figures with the same theme but
    differ-ent
    shapes. Pick one at random, if you get what you want, consumers will feel lucky and happy, and
    they
    will want to collect a whole set to bring satisfaction and a sense of achievement. If you get a
    one
    that is not what you want, disappointment and unwillingness will cause a "gambler's mentality",
    prompting consumers to buy again until they win the lottery. Curiosity drives consum-ers to try
    it
    the first time, and desire to collect drives repeat purchases.`
},
{
    title: "#4 Scarcity Effect",
    content: `  Businesses use "hunger marketing" to create a sense of scarcity. In consumer psychology, peo-ple
    call the change in purchasing behaviors caused by "scarce things more expensive" as the
    "Scarcity
    Effect". The sale of the blind box is usually “fixed model” + “hidden model”, the number of
    "hidden
    models" is very rare, and the probability of winning is only 1/144. This relatively scarce
    product
    attracts consumers and stimulates their desire to buy.`
},


]

let i = 0
function initPage7() {
    // d3.select('#p7Content').append('div').html(p7data[0].content).attr('class', 'contentText p7Content')
    // d3.select('#p7Titles').append('div').html(p7data[0].title).attr('class', 'title p7title')
    // d3.select('#p7Line').append('div').attr('class', 'p7redline')

    let div = d3.select('#p7Content').selectAll('div').data(p7data).join('div').style('height', '70vh')
    let content = div.append('div').attr('class', (d, i) => `contentText p7Content`).html(d => d.content)


    // window.addEventListener('scroll', (e) => {
    //     console.log(e);
    // })

    let titles = d3.select('#p7Titles').append('div').style('position', 'sticky').style('top', '70px')

    titles.selectAll('div').data(p7data).join('div').html(d => d.title).attr('class', 'p7title title')

}

initPage7()

// d3.select('#page7').on('click', () => {

//     i = i + 1
//     if (i > 3) i = 0;
//     console.log(p7data[i].content);
//     // 一个个的添加数据
//     d3.select('#p7Content').text(p7data[i].content).attr('class', 'contentText p7Content')
//     d3.select('.p7redline').style('height', `${ 25 * (i + 1) } % `)
//     let arr = p7data.slice(0, i + 1)

// })


function page4TrendTitleFormat(div, color, name) {
    div.selectAll('.title1').data([0]).join('div').attr('class', 'title1').html('THE TREND' + name)
        .style('color', '#ffffff')
        .style('text-shadow', `2px 2px ${color}`)
        .style('font-size', '3rem')
        .style('height', '4rem')
        .style('line-height', '4rem')
        .style('text-align', 'left')

    // 改变背景色

}

function page4_append_image_right_bottom(div, name) {
    div.append('img').attr('src', `./ img / ${name}.png`).style('position', 'absolute')
        .style('bottom', '0')
        .style('right', '-200px')
        .style('z-index', 99)
        .style('height', "40%")
}


d3.selectAll('.guessSymbol').on('click', (e) => {
    // let src = e.target.src
    // let name = src.split('/').at(-1).split('.').at(-2)
    // console.log(name);

    d3.select('#p2symbol1').style('color', '#69FF43').style('border', 'solid 1px #69FF43')
    d3.select('#p2symbol2').style('color', '#FF4343').style('border', 'solid 1px #FF4343')
    d3.select('#p2symbol3').style('color', '#FF4343').style('border', 'solid 1px #FF4343')

})




function addAnimation(div, text, imgSrc) {

    let texts = div.selectAll('.contentText2').data([0]).join('div')
    texts.attr('class', 'contentText2')
    texts.style('display', 'none')
        .transition()
        .delay(1000)
        .duration(100).style('display', 'block')
    texts.html(text)
    if (imgSrc) {

        let img = div.append('img').attr('src', `./img/${imgSrc}.png`)
        img.style('display', 'none')
            .transition()
            .delay(1000)
            .style('display', 'block')
            .attr('width', '90%')
            .style('padding-left', "5%")
    }
}


