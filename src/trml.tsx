import { Child, FC, PropsWithChildren, JSX } from 'hono/jsx'

type ChildrenOnly = {
}

export function Screen({ children }: PropsWithChildren<ChildrenOnly>) {
    return (
        <html>
        <head>
            <link rel="stylesheet" href="https://usetrmnl.com/css/latest/plugins.css"/>
            <link rel="stylesheet" href="https://usetrmnl.com/js/latest/plugins.js"/>
        </head>
        <style dangerouslySetInnerHTML={{
            __html: `
            .trmnl .view--full .layout {
              padding: 0px;
            }
            .trmnl .columns {
              align-items: self-start;
            }
          `
        }}/>
        <body className="environment trmnl">
        <div className="screen">
            {children}
        </div>
        </body>
        </html>
    );
}

type FullProps = {
    title?: string
    instance?: string
}
export function Full({ title = "Strava", instance = "for Robert", children }: PropsWithChildren<FullProps>) {
    return (
        <Screen>
            <div className="view view--full">
                <div className="layout">
                    {children}
                </div>

                <div className="title_bar">
                    <img
                        className="image"
                        src="https://usetrmnl.com/images/plugins/trmnl--render.svg"
                        alt="Terminal Render"
                    />
                    <span className="title">{title}</span>
                    <span className="instance">{instance}</span>
                </div>
            </div>
        </Screen>
    );
}

// <div class="columns">
export function Columns({ children }: PropsWithChildren<ChildrenOnly>) {
    return (
        <div className="columns">
            {children}
        </div>
    );
}

//   <div class="column">
export function Column({ children }: PropsWithChildren<ChildrenOnly>) {
    return (
        <div className="column">
            {children}
        </div>
    );
}
