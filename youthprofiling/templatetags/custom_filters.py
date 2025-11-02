from django import template
from datetime import datetime, timedelta, date

register = template.Library()

@register.filter
def add_years(value, years):
    try:
        if isinstance(value, str):
            try:
                value = datetime.fromisoformat(value)
            except ValueError:
                value = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")

        if isinstance(value, date):
            try:
                return value.replace(year=value.year + years)
            except ValueError:
                return value + (date(value.year + years, 1, 1) - date(value.year, 1, 1))
    except Exception:
        return value


@register.filter
def calculate_valid_until(created_at, user_age):
    current_age = user_age
    years_valid = 3

    if current_age >= 28:
        years_valid = 30 - current_age
    elif current_age >= 26:
        years_valid = 30 - current_age

    if years_valid < 1:
        years_valid = 1

    valid_until = created_at + timedelta(days=365 * years_valid)
    return valid_until
