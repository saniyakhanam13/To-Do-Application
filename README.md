# VortexTodo 🚀

VortexTodo is a high-fidelity, interactive, client-side To-Do List application that pairs premium glassmorphic UI aesthetics with robust state management and local data persistence. It allows you to organize, categorize, search, sort, and complete your tasks with responsive animations and interface feedback.

## ✨ Features

- **Full CRUD Support**: Create tasks, read them dynamically, edit task properties via custom modal overlays, and delete tasks with smooth transition exit animations.
- **Local Persistence**: Automatically persists current task states and your preferred display theme (Light/Dark) in `window.localStorage`.
- **Advanced Filtering**: Categorize tasks by **All**, **Active** (Pending), and **Completed** status.
- **Dynamic Search**: Instantaneous search indexing across task titles and descriptions.
- **Multi-Criteria Sorting**: Sort your tasks by Newest First, Oldest First, Due Date (Soonest), or Priority level.
- **Categorization & Priorities**: Group items by Work, Personal, Shopping, Finance, or Health categories, and set priorities (High, Medium, Low) with custom color badges.
- **Intelligent Due Dates**: Automatically highlights tasks that are due Today, Tomorrow, or Overdue.
- **Statistics Dashboard**: Live tracking dashboard displaying task summaries and interactive SVG radial completion percentage.
- **Interactive Audio Feedback**: Provides subtle sound cues for task completion and deletion.

## 🛠️ Built With

- **Structure**: Semantic HTML5 markup
- **Styling**: Modern CSS3 (featuring HSL colors, CSS custom properties, backdrop filters, flexbox, grid, and animations)
- **Logic**: Vanilla ES6+ JavaScript (State-driven DOM rendering, delegated event listeners)
- **Assets**: Font Awesome CDN icons, Google Fonts (Outfit & Plus Jakarta Sans)

## 🚀 How to Run the Project

No compilation, installations, or dependencies are required. You can launch and use VortexTodo directly in your browser:

### Method 1: Local Direct Launch
1. Clone the repository:
   ```bash
   git clone https://github.com/saniyakhanam13/To-Do-Application.git
   ```
2. Navigate to the project directory:
   ```bash
   cd To-Do-Application
   ```
3. Open the `index.html` file in any modern web browser (Double-click or drag-and-drop).

### Method 2: Serving Locally (e.g. Python, Node)
If you prefer running it via a local development server, run one of the following commands in the project folder:
* Using Python:
  ```bash
  python -m http.server 8085
  ```
* Using Node (`http-server`):
  ```bash
  npx http-server -p 8085
  ```
Then open **[http://localhost:8085](http://localhost:8085)** in your browser.

## 📁 Repository Structure

```
To-Do-Application/
│
├── index.html     # Application structure and markup
├── style.css      # CSS styling rules, custom theme variables, and glassmorphism styling
├── app.js         # State machine, CRUD operations, DOM renders, and local storage sync
└── README.md      # Documentation
```

## 📜 License
This project is open source and available under the [MIT License](LICENSE).
