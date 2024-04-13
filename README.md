
# Usage
The project is deployed here: https://plaquetv.z5.web.core.windows.net/

Plaques shown at Dharma Treasury Temple,
[Medicine Master Buddha and As You Wish plaques](
https://plaquetv.z5.web.core.windows.net?tv=dtttv1)

[Rebirth plaques](https://plaquetv.z5.web.core.windows.net?tv=dtttv2)

# Development
`npm install --force` to install all dependencies
`npm start` to start a local dev server
`npm run build` build the website in the _build_ folder and copy the _build_ folder content to the staging environment at Azure blob storage to deploy changes

## Deployment
The website is hosted on Azure Storage, in the _$web_ container of storage account of _plaquetv_. Copy the content of _build_ folder to the _$web_ container will deploy the new build.

Copy can be done on Azure portal, Azure Storage Explorer, or Azure command line.
 
Check `deployToProd` task in package.json to see a sample command of using Azure command line tools.

# Team
It is developed by Ray Juang (https://github.com/rjuang) and Ray Xu (https://github.com/incredibleray)
code written before 5/5/2023 are collapsed into the first commit.

# Plaque Data
All plaque data are contained in plaques.json file.

## Set up Cron for updating plaques.json.
### edit cron
`crontab -e`

### start cron on Ubuntu 18.04
`sudo service cron start`

### cron jobs
`0 * * * * cd /mnt/d/Bin/trade/trading_tech/otm_puts && /mnt/d/Bin/trade/venv/bin/python /mnt/d/Bin/trade/trading_tech/otm_puts/get_quote.py`

`0 * * * * /mnt/d/Bin/trade/venv/bin/python /mnt/d/Bin/trade/trading_tech/otm_puts/tda_api.py --tda_api_program='watch_list_quotes' --save_location='/mnt/d/Bin/quotes'`

`1 * * * * /mnt/d/Bin/trade/venv/bin/python /mnt/d/Bin/trade/trading_tech/otm_puts/tda_api.py --tda_api_program='save_option_chains' --save_location='/mnt/f'`

`5,55 * * * * /mnt/d/Bin/trade/venv/bin/python /mnt/d/Bin/trade/trading_tech/otm_puts/tda_api.py --tda_api_program='index_put_iv' --save_location='/mnt/d/Bin/quotes'`

# Thank you to the devs of the following projects. You made this work possible.
* Create-React-app
* react-grid-gallery
* fontsource
* axios
* react-card-flip
* react-player
* react-responsive-carousel
* react-redux, @reduxjs/toolkit
* pillow
* react-use-keypress
* material-ui (mui.com)
