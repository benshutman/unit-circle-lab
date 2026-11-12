# Unit Circle Lab

[Open Unit Circle Lab in your browser](https://benshutman.github.io/unit-circle-lab/).

## Open in VS Code

1. Clone or download this repository.
2. In VS Code choose **File → Open Folder** and select `Unit_Circle_Lab` (the folder containing `app.py`).
3. Install the Microsoft Python extension if prompted, and use **Python: Select Interpreter** to select Python 3.10 or newer. Python 3.13 works.
4. Open `app.py` and click **Run Python File**, or press **F5** and choose **Run Unit Circle Lab**.
5. Your browser opens the lab. Keep the terminal running; press Ctrl+C to stop.

Or run from the folder's terminal:

```sh
python app.py
```

On macOS/Linux, use `python3 app.py` if `python` is unavailable. No pip install, virtual environment, internet connection, or account is required. If the browser does not open automatically, click the localhost URL printed in the terminal.

## Included functionality

- Drag/tap the circle, snap to special angles, slider, ±1° steps and presets.
- Degrees/radians; negative angles and multiple turns; expressions such as `7pi/6`.
- Signed sides **a = y**, **b = x**, **c = 1**, with color labels.
- All six functions with side-letter fractions, word fractions, numeric substitutions, exact values and decimals.
- All six inverses, principal-range arcs, examples and input validation.
- Linked forward/inverse graphs, asymptotes, domains, ranges and periods.
- Reference angle, quadrant signs and step-by-step explanations.

## Project structure

`app.py` is a dependency-free Python launcher/local server. The original browser interface is preserved in `web/` (HTML, CSS and JavaScript), so the interaction and appearance match the exported Site. The interface's calculations run in JavaScript. This is a Python-launched browser app, not a native Python desktop GUI.

`trig_math.py` provides the corresponding calculations in Python for experiments, scripts or a future native UI:

```python
from trig_math import values, inverse, exact, pi_exact
print(values(30))
angle = inverse("tan", -(3 ** 0.5))
print(angle, pi_exact(angle))  # -60 degrees, −π/3
print(exact(values(30)["sin"]))  # 1/2
```

Undefined values are `None`. Angles are in degrees internally. Side a and b carry coordinate signs; geometric lengths are their absolute values. The inverse conventions match the Site: arccsc = arcsin(1/v), arcsec = arccos(1/v), arccot in (0°,180°). Textbook conventions may differ.

GitHub Pages serves the four files in `web/` directly. Push changes to `main` to redeploy.
