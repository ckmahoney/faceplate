import m from 'mithril'
import * as lib from './lib'

const LogoExample1: m.Component = {
    view: () => {
      return m(
        ".logo-example",
        {
          style: {
            fontFamily: "Arial, sans-serif",
            letterSpacing: "0.1em",
            color: "linear-gradient(to right, #FF6B6B, #556270)",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
          },
        },
        "Ten Pen"
      );
    },
  };

  const LogoExample2: m.Component = {
    view: () => {
      return m(
        ".logo-example",
        {
          style: {
            fontFamily: "Verdana, sans-serif",
            letterSpacing: "normal",
            color: "#FFD700",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
          },
        },
        "Ten Pen"
      );
    },
  };
  
  const LogoExample3: m.Component = {
    view: () => {
      return m(
        ".logo-example",
        {
          style: {
            fontFamily: "Impact, sans-serif",
            letterSpacing: "-0.05em",
            color: "#5A78FF",
            filter: "blur(2px)",
            transform: "rotate(-15deg)",
          },
        },
        "Ten Pen"
      );
    },
  };
  
  const LogoExample4: m.Component = {
    view: () => {
      return m(
        ".logo-example",
        {
          style: {
            fontFamily: "Georgia, serif",
            letterSpacing: "-0.02em",
            color: "#333",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
          },
        },
        "Ten Pen"
      );
    },
  };
  const LogoExample5: m.Component = {
    view: () => {
      return m(
        ".logo-example",
        {
          style: {
            fontFamily: "Times New Roman, serif",
            letterSpacing: "0.05em",
            color: "#222",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
          },
        },
        "Ten Pen"
      );
    },
  };

  const LogoExample6: m.Component = {
    view: () => {
      return m(
        ".logo-example",
        {
          style: {
            fontFamily: "Palatino Linotype, serif",
            letterSpacing: "0.02em",
            color: "#444",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
          },
        },
        "Ten Pen"
      );
    },
  };

  const LogoExample7: m.Component<{onclick:Function}> = {
    view: ({attrs}) => {
      const {onclick}=attrs
      return m(
        ".logo",
        {
          onclick,
          style: {
            fontFamily: "Helvetica, Arial, sans-serif",
            letterSpacing: "0.05em",
            color: "#555",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
            transform: "rotate(-2deg)",
          },
        },
        "Ten Pens"
      );
    },
  };

export function header(): m.Component<{goto?:Function}> {
    return {
        view: ({attrs}) => {
            let style = {style: {display: "flex", justifyContent: "space-around", alignItems: "center"}}
            const size = window.innerWidth > 758 ? ".is-size-1.px-3.py-5" : ".is-size-3.p-3"
            if ( !attrs.goto) {
                return m("header" + size, style,
                    m(LogoExample7)
                )
            } else {
                let button
                if (lib.isMobile()) {
                  button = "button.button.m-0.is-size-5.has-text-light.has-background-black"
                } else {
                  button = "button.button.m-0.is-size-3.has-text-light.has-background-black"
                }
                return m("header.is-flex.is-justify-content-space-between" + size, style,
                    m(LogoExample7, {onclick: (e:any) => attrs.goto()}),
                    m(button, {onclick: (e:any) => attrs.goto()}, "Nexus")
                )
        
            }
        }
    } 
}

export default header 