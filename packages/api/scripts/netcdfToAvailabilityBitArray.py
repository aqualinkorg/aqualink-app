from netCDF4 import Dataset
import numpy as np

# Files can be acquired from https://coralreefwatch.noaa.gov/
# https://www.star.nesdis.noaa.gov/pub/sod/mecb/crw/data/5km/v3.1_op/nc/v1.0/daily/sst/2022/
fn = "/path/to/some/netcdf4.ns"

ds = Dataset(fn)

# insert some valid variable.
# variables and additional information can bee checked by uncommenting the line below:
# print(ds)
var = ds['degree_heating_week'][:]

world = []

for i in range(7200):
    world.append(var[0, 0:3600, i].mask)

# The api round up at 6th decimal point. ie 24.549999 will give different value from 24.54999.
# True means a value is invalid. 

bitarray = np.packbits(np.array(world), axis=-1)

# Please move file to assets after generation
np.save('data.npy', bitarray)
