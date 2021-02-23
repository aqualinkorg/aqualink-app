#!/bin/bash
# Download NOAA Climatology NETCDF file
wget -nc ftp://ftp.star.nesdis.noaa.gov/pub/sod/mecb/crw/data/5km/v3.1/climatology/nc/ct5km_climatology_v3.1.nc

# Transform MMM and Monthly Max into a Cloud Optimized Geotiff - https://www.cogeo.org/
gdal_translate NETCDF:"./ct5km_climatology_v3.1.nc":sst_clim_mmm sst_clim_mmm.tiff -co COMPRESS=LZW -co TILED=YES

declare -a Months=("january" "february" "march" "april" "may" "june" "july" "august" "september" "october" "november" "december")

# Convert data for every months
for month in ${Months[@]}; do
   gdal_translate NETCDF:"./ct5km_climatology_v3.1.nc":sst_clim_$month sst_clim_$month.tiff -co COMPRESS=LZW -co TILED=YES
done

rm ./ct5km_climatology_v3.1.nc
