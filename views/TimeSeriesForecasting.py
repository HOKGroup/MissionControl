#Alberto Tono, TTCore Hackathon

import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib as plt
import os
import json
import re
from pandas.io.json import json_normalize
import datetime
import matplotlib.pyplot as plt
from matplotlib import pyplot
import plotly.plotly as py
import plotly.tools as tls

with open("views4.json", "r+") as read_file:
    data = read_file.read()
    x = re.sub("\w+\((.+)\)", r'\1', data)
    print(x)
read_file.closed

with open("views4.json", "r+") as read_file:
    data = read_file.read()
    x = re.sub("\w+\((.+)\)", r'\1', data)
    print(x)
read_file.closed
df = pd.read_json(x)
df2 = pd.DataFrame(df['viewStats'].tolist())
df2.drop("_id", axis=1)
df2['createdOn'] =  pd.to_datetime(df2['createdOn'], format='%Y-%m-%dT%H:%M:%S.%f')
dataset = df2.drop("_id", axis=1)
dataset

