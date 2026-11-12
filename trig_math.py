"""Reusable Python equivalent of the lab's browser calculations (angles in degrees)."""
import math
from fractions import Fraction

FUNCTIONS = ("sin", "cos", "tan", "csc", "sec", "cot")
SIDE_RATIOS = {"sin": ("a", "c"), "cos": ("b", "c"), "tan": ("a", "b"),
               "csc": ("c", "a"), "sec": ("c", "b"), "cot": ("b", "a")}
PRINCIPAL_RANGES = {"sin": "[-90°, 90°]", "cos": "[0°, 180°]",
    "tan": "(-90°, 90°)", "csc": "[-90°, 0°) ∪ (0°, 90°]",
    "sec": "[0°, 90°) ∪ (90°, 180°]", "cot": "(0°, 180°)"}


def clean(number):
    return 0.0 if abs(number) < 1e-12 else number


def normalize(degrees):
    if not math.isfinite(degrees):
        raise ValueError("Enter a finite angle.")
    return degrees % 360


def values(degrees):
    radians = math.radians(normalize(degrees))
    s, c = clean(math.sin(radians)), clean(math.cos(radians))
    return {"sin": s, "cos": c, "tan": clean(s/c) if c else None,
            "csc": 1/s if s else None, "sec": 1/c if c else None,
            "cot": clean(c/s) if s else None}


def inverse(function, number):
    if function not in FUNCTIONS or not math.isfinite(number):
        raise ValueError("Choose a function and enter a finite real number.")
    if function in ("sin", "cos") and abs(number) > 1:
        raise ValueError("Input must be in [-1, 1].")
    if function in ("csc", "sec") and abs(number) < 1:
        raise ValueError("Input must be ≤ -1 or ≥ 1.")
    operations = {"sin": lambda: math.asin(number), "cos": lambda: math.acos(number),
        "tan": lambda: math.atan(number), "csc": lambda: math.asin(1/number),
        "sec": lambda: math.acos(1/number), "cot": lambda: math.atan2(1, number)}
    return clean(math.degrees(operations[function]()))


def reference(degrees):
    n = normalize(degrees)
    return n if n <= 90 else 180-n if n <= 180 else n-180 if n <= 270 else 360-n


def quadrant(degrees):
    n = normalize(degrees)
    return "On an axis" if abs(n % 90) < 1e-8 else "Quadrant " + ("I", "II", "III", "IV")[int(n // 90)]


def exact(number):
    if number is None:
        return "undefined"
    known = [(0, "0"), (.5, "1/2"), (math.sqrt(2)/2, "√2/2"),
        (math.sqrt(3)/2, "√3/2"), (1, "1"), (math.sqrt(3)/3, "√3/3"),
        (2*math.sqrt(3)/3, "2√3/3"), (math.sqrt(2), "√2"), (math.sqrt(3), "√3"), (2, "2")]
    for value, text in known:
        if abs(abs(number)-value) < 1e-10:
            return ("−" if number < -1e-11 else "") + text
    return None


def pi_exact(degrees):
    if abs(degrees) < 1e-10:
        return "0"
    ratio = degrees/180
    for denominator in range(1, 73):
        numerator = round(ratio*denominator)
        if abs(ratio-numerator/denominator) < 1e-10:
            f = Fraction(numerator, denominator)
            prefix = "−" if f.numerator < 0 else ""
            coefficient = "" if abs(f.numerator) == 1 else str(abs(f.numerator))
            return prefix + coefficient + "π" + ("" if f.denominator == 1 else f"/{f.denominator}")
    return None
