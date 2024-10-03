from setuptools import setup, find_packages

with open("requirements.txt") as f:
    requirements = f.read().strip().split("\n")

setup(
    name='portal',
    version='0.1',
    packages=find_packages(),
    install_requires=requirements,
    entry_points={
        'console_scripts': [
            'your_app_name=your_app_name.main:run',
        ],
    },
)