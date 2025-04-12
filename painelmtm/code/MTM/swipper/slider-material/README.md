# Material You Slider

Material You Slider is a premium [Swiper](https://swiperjs.com) effect plugin that adds Material You transition effects.

It can be easily integrated into your [Framework7](https://framework7.io) or [Ionic](https://ionicframework.com) app as Swiper already integrated into these frameworks.

Inspired by Google's official [Material You Carousel](https://m3.material.io/components/carousel/overview)

## Features

- it is based on [Swiper](https://swiperjs.com), so it supports most of Swiper features
- any content can be placed within slides
- can be actually any size (aspect ratio)
- can be used for any kind of content presentation (gallery, recommendations, etc.)

## Limitations

There are some small limitations comes with this effect:

- `slidesPerView: "auto"` is not supported with this effect
- `spaceBetween` parameter will work only when `slidesPerView > 1`
- requires at least Swiper version `11.0.5` or higher

## Package

In the package you will find:

- static demo - using plain HTML, CSS, and JS
- modules demo - project using ES modules created with Vite
- all required extra styles
- all required JavaScript to make it work
- instructions on how to build, run and preview the project

## Swiper Studio

This effect is also available in [Swiper Studio](https://studio.swiperjs.com)

<!-- STORE_END -->

## Project Structure

This project uses [Vite](https://vitejs.dev) for development and bundling the production build.

- `/demo-static/` - folder with static demo using plain HTML, CSS and JS files
- `/demo-vite/` - folder with `.html`, `.js`, `.scss` source files. These files are processed by Vite during development, and will be bundled on production build.
- `/dist/` - folder with Material Effect scripts and sources
- `/assets/` - folder with static assets (usually images) which are not processed by Vite during development, but still will be bundled on production build.
- `/www/` - folder with production build bundled with Vite (this folder will appear when you run a command to create production build).

## Usage

### HTML Layout

Check `./demo-vite/index.html` (or `./demo-static/index.html`) for required HTML layout example

Main requirement here is to wrap slide's content with two elements:

- `<div class="swiper-material-wrapper">` - main slide content wrapper, this element is what you see is resized
- `<div class="swiper-material-content">` - put actual slide's content here

```html
<div class="swiper-slide">
  <!-- Wrap each slide content with "swiper-material-wrapper" and "swiper-material-content" elements -->
  <div class="swiper-material-wrapper">
    <div class="swiper-material-content">
      <!-- Use data-swiper-material-scale to add scale effect on required elements -->
      <img
        class="demo-material-image"
        data-swiper-material-scale="1.25"
        src="images/01.jpg"
      />
      <!-- Use swiper-material-animate-opacity class to add opacity animation on required elements -->
      <span class="demo-material-label swiper-material-animate-opacity"
        >Slide 1</span
      >
    </div>
  </div>
</div>
```

We can also:

- scale elements during transition between slides by adding `data-swiper-material-scale` attribute to such elements (like IMG element in the example above)
- animate elements opacity during transition between slides by adding `swiper-material-animate-opacity` class to such elements

### In Browser Environment

You need to include Material Effect scripts and styles in addition to Swiper scripts and styles from the (`./dist/` folder), e.g.

```html
<head>
  <!-- Swiper styles -->
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
  />
  <!-- Material Effect styles -->
  <link rel="stylesheet" href="path/to/effect-material.min.css" />
</head>

<body>
  <div id="app">
    <!-- Material slider -->
    <div class="swiper">
      <!-- ... -->
    </div>
  </div>
  <!-- Swiper script -->
  <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
  <!-- Material effect script -->
  <script src="path/to/effect-material.min.js"></script>
</body>
```

### In ESM Environment

In environment with ES modules support (webpack, Vite, rollup, etc.), you can just import `effect-material.esm.js` and `effect-material.css` (or `effect-material.scss`) from the `./dist/` folder, e.g.:

```js
// import Material effect module
import EffectMaterial from './effect-material.esm.js';
// import Material effect styles
import './effect-material.scss';
```

### Initialization

After you included (or imported) required Material Effect scripts and styles and have the required layout, you need to pass Material Effect module to Swiper constructor and set effect to `'material'`:

In browser environment:

```html
<head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
  />
  <link rel="stylesheet" href="path/to/effect-material.min.css" />
</head>

<body>
  <div id="app">
    <!-- Material slider -->
    <div class="swiper">
      <!-- ... -->
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
  <script src="path/to/effect-material.min.js"></script>
  <!-- Init Material Effect -->
  <script>
    const swiper = new Swiper({
      // pass EffectMaterial module to modules
      modules: [EffectMaterial],
      // specify "material" effect
      effect: 'material',
      // other parameters
    });
  </script>
</body>
```

In ESM environment:

```js
import Swiper, { Autoplay, Navigation, Pagination } from 'swiper';
import EffectMaterial from './effect-material.esm.js';
import './effect-material.scss';
import './main.scss';

// Init Material Effect
const swiper = new Swiper({
  // pass EffectMaterial module to modules
  modules: [Autoplay, Navigation, Pagination, EffectMaterial],
  // specify "material" effect
  effect: 'material',
  // material effect parameters
  materialEffect: {
    slideSplitRatio: 0.65,
  },
  // other parameters
});
```

## Split Ratio

When `centeredSlides` parameter is disable, then last slide's split ratio can be configure with the `materialEffect.slideSplitRatio` parameter:

#### `materialEffect.slideSplitRatio: 0.65`

![](https://s.uiinitiative.com/items/material-you-slider/docs/0.65.png)

#### `materialEffect.slideSplitRatio: 0.5`

![](https://s.uiinitiative.com/items/material-you-slider/docs/0.5.png)

#### `materialEffect.slideSplitRatio: 0.25`

![](https://s.uiinitiative.com/items/material-you-slider/docs/0.25.png)

When `centeredSlides` parameter is enabled, then split ratio can be configure with the `slidesPerView` parameter when its value is between `1` and `2`:

#### `centeredSlides: true` `slidesPerView: 2`

![](https://s.uiinitiative.com/items/material-you-slider/docs/2.png)

#### `centeredSlides: true` `slidesPerView: 1.6`

![](https://s.uiinitiative.com/items/material-you-slider/docs/1.6.png)

#### `centeredSlides: true` `slidesPerView: 1.3`

![](https://s.uiinitiative.com/items/material-you-slider/docs/1.3.png)

## Usage with React

Usage with Swiper React components is pretty similar, there only difference is we need to pass all mentioned above `Swiper` parameters as `<Swiper>` component properties:

```jsx
import React from 'react';
import Swiper, { Autoplay, Navigation, Pagination } from 'swiper';
import EffectMaterial from './effect-material.esm.js';
import './effect-material.scss';
import './main.scss';

export default function App() {
  return (
    <div>
      ...
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectMaterial]}
        effect="material"
      >
        <SwiperSlide>...</SwiperSlide>
        <SwiperSlide>...</SwiperSlide>
        <SwiperSlide>...</SwiperSlide>
        <SwiperSlide>...</SwiperSlide>
      </Swiper>
    </div>
  );
}
```

## Development Preview

First of all, we need to install all dependencies, run in terminal:

```
npm i
```

To launch development server (with hot reload), run the following command in terminal:

```
npm run dev
```

And the project will be available at [http://localhost:3000](http://localhost:3000)

## Production Build

To create a production build, run the following command in terminal:

```
npm run build-dist
```

And production-ready project will be available in `/dist/` folder.

## Connect to Git

It is possible to connect this project folder to the new repository. For example for GitHub:

1. Create new GitHub repository at https://github.com/new

2. Initialize Git. In terminal run:

   ```
   git init
   ```

3. Add remote origin. Replace $USERNAME and $REPOSITORY with your GitHub username and newly created repository name:
   ```
   git remote add origin https://github.com/$USERNAME/$REPOSITORY.git
   ```

That is all, after that you can track, commit and push/pull to repo, for example:

```
git add .
git commit -m "initial commit"
git push origin master
```
