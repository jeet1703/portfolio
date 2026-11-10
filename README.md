# Prabhjeet Singh · Portfolio

**Live: [prabhjeetsingh.tech](https://prabhjeetsingh.tech/)**

My portfolio, built as a little power rig. Flip the switch on a 3D power supply and a cable
unspools down the page as you scroll, plugging into each section and powering it on.

I'm a software engineer working mostly on backend systems: Java, Spring Boot, Go and Node.js,
with Kafka, Redis, Docker and Kubernetes around them. I'm open to SDE, backend and DevOps roles
in Delhi NCR or remote, and can join immediately.

## What's on the page

| Section | Device | What it shows |
| --- | --- | --- |
| Power | 3D power supply | Click it (or the switch) to power the site on; a boot terminal pops up |
| Experience | Output rails | Samsung Electro-Mechanics, DRDO, Amity; each card switches on when the cable reaches its connector |
| Skills | 3D keyboard | Every key is a tool I use; click a key (or type a letter) to see where I've used it |
| Projects | 3D mouse + monitor | Left/right buttons flip through Chess Arena, SpeedyFix Auto Sales, WebVizion and EquipControl, with live canvas previews |
| Record | POST screen | LeetCode, hackathons, certifications, running as a power-on self test |
| Contact | CRT monitor | Lights up when the cable plugs in; press Enter to email me |

Sound is part of it (all synthesised with Web Audio, no audio files), so turn it on.

## Projects featured

- **[Chess Arena](https://chess-prabjeet.netlify.app)**: real-time multiplayer chess with server-side move validation, matchmaking and reconnection. Backend written in both Node.js and Go. ([code](https://github.com/jeet1703/Chess))
- **[SpeedyFix Auto Sales](https://speedyfixautosales.com/)** (freelance): an online shop for a UK car parts seller. React + TypeScript storefront on a Java 21 / Spring Boot API with PostgreSQL; reg-plate part fitment, eBay-style filters, an AI agent that helps shoppers find parts and track orders, PayPal, FedEx and other API integrations, and a Seller Hub admin.
- **[WebVizion](https://webvizion.netlify.app)**: a Real User Monitoring backend in Java/Spring Boot microservices; batching and async processing cut network overhead by 80%. ([code](https://github.com/jeet1703/webvision))
- **EquipControl**: a C++/Qt supervisory control app, built with CMake and tested with GoogleTest. ([code](https://github.com/jeet1703/EquipControl-))

## Built with

- [React 19](https://react.dev) + [Vite](https://vite.dev)
- [three.js](https://threejs.org) for the power supply, keyboard and mouse
- Web Audio API for every sound
- Plain SVG for the cable. Its path is computed in JS, so drawing it stays smooth while you scroll

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run lint
```

## Where things live

```
src/
  App.jsx              page layout, power state, scrolling, global keys
  components/          one component per section, plus Cable, Jack and the navbar/dock
  rig/
    data.js            all the content: experience, skills, projects, record
    sound.js           synthesised sound effects
    scenes.js          the animated canvas previews in the projects player
    three/             three.js scenes: psu.js, keyboard.js, mouse.js
  styles/rig.css       all styles
```

To change what the site says, edit `src/rig/data.js`.

## Contact

- Email: [prabhjeetdec03@gmail.com](mailto:prabhjeetdec03@gmail.com)
- LinkedIn: [prabhjeetsinghhh](https://www.linkedin.com/in/prabhjeetsinghhh/)
- GitHub: [jeet1703](https://github.com/jeet1703)
