"""
pytest configuration — sets asyncio mode and sys.path so
tests can import from the server package root.
"""
import sys
import os

# Add server root to path so 'from core.xxx import ...' works in tests
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Asyncio mode for pytest-asyncio

def pytest_configure(config):
    config.addinivalue_line(
        "markers", "asyncio: mark test as async"
    )
