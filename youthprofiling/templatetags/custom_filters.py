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
