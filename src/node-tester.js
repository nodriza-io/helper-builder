var code = `function (options="title=this.title name='Wilmar'") {
    const style = \`<style>
        span {
            color: red;
        }
    </style>\`
    return '<span style="color: red;">Hola i --> ' + options.hash.name + '</span>'
}`





let res = eval(`(()=>${ code })()`)

console.log(res({ hash: { name: 'Wilmar' } }))