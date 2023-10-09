# Faceplate
## A UI for generating music

This is the frontend of the Ten Pens project. It is made with TypeScript. Most of the type definitions are in src/types.ts, and you will find some others local to their respective module.


## development
Once cloned, you should be able to immediately run `npm run dev` to have a new window open to http://localhost:9000 and displaying a login screen.

Because it won't connect to any auth server, you won't be able to log in.
You choose which view is rendered by editing src/index.ts. There are no guarantees of functionality as none of the upstream data servers are mocked at the moment.

## build

To build, use `npm run build`. This emits a bundled file called `local-faceplate-client.js`. This is a single file which can be loaded on any webpage. When the webpage includes an HTML element with id "root", the application will render.
