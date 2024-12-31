export function screen(inner) {
    return `
          <!DOCTYPE html>
          <html>
            <head>
              <link rel="stylesheet" href="https://usetrmnl.com/css/latest/plugins.css">
              <link rel="stylesheet" href="https://usetrmnl.com/js/latest/plugins.js">
            </head>
            <body class="environment trmnl">
              <div class="screen">
                ${inner}
              </div>
            </body>
          </html>
        `
}

export function full(inner) {
    return screen(
      `<div class="view view--full">
          <div class="layout layout--col">
            ${inner}
          </div>
          
          <div class="title_bar">
            <img class="image" src="https://usetrmnl.com/images/plugins/trmnl--render.svg" />
            <span class="title">Football</span>
            <span class="instance">for Robert</span>
          </div>
      </div>`
    )
}
