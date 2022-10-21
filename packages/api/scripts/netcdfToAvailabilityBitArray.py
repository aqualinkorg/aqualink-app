from netCDF4 import Dataset
import numpy as np
import pathlib
import sys 

# Files can be acquired from https://coralreefwatch.noaa.gov/
# https://www.star.nesdis.noaa.gov/pub/sod/mecb/crw/data/5km/v3.1_op/nc/v1.0/daily/sst/2022/
# Full path to file, ex "path/to/coraltemp_v3.1_20221012.nc"
path = sys.argv[1]

ds = Dataset(path)

# insert some valid variable.
# variables and additional information can bee checked by uncommenting the line below:
# print(ds)
var = ds['analysed_sst'][:]

world = []

for i in range(7200):
    world.append(var[0, 0:3600, i].mask)

# The api round up at 6th decimal point. ie 24.549999 will give different value from 24.54999.
# True means a value is invalid. 

bitarray = np.packbits(np.array(world), axis=-1)

np.save(pathlib.Path(__file__).parent.parent / 'src/assets/NOAA_SST_availability.npy', bitarray)
np.save(pathlib.Path(__file__).parent.parent / 'cloud-functions/assets/NOAA_SST_availability.npy', bitarray)
