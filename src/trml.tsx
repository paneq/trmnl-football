interface ScreenProps {
    children: React.ReactNode;
}

interface FullProps {
    children: React.ReactNode;
    title?: string;
    instance?: string;
}

export function Screen({ children }: ScreenProps) {
    return (
        <html>
        <head>
            <link rel="stylesheet" href="https://usetrmnl.com/css/latest/plugins.css" />
            <link rel="stylesheet" href="https://usetrmnl.com/js/latest/plugins.js" />
        </head>
        <body className="environment trmnl">
        <div className="screen">
            {children}
        </div>
        </body>
        </html>
    );
}

export function Full({ children, title = "Football", instance = "for Robert" }: FullProps) {
    return (
        <Screen>
            <div className="view view--full">
                <div className="layout layout--col">
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
