FROM python:3

WORKDIR /app

COPY . /app

RUN pip3 install --no-cache-dir schedule requests

CMD ["python", "poll_openmrs.py"]
