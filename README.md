# Thank you, all the devs of projects below that make this work possible
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

# Usage
go to https://plaquetv.z5.web.core.windows.net/

https://plaquetv.z5.web.core.windows.net?tv=1 shows MMB and wish plaques
https://plaquetv.z5.web.core.windows.net?tv=2 shows rebirth plaques


# Development
`npm install --force` to install all dependencies
`npm start` to start a local dev server
`npm run build` and copy the build folder to Azure blob storage to deploy changes

## deployment in command line
```
az storage azcopy blob upload -c "\$web" --account-name plaquetv -s "build/*" --recursive
```

# cron
## edit cron
`crontab -e`

## start cron on Ubuntu 18.04
`sudo service cron start`

## cron jobs
`0 * * * * cd /mnt/d/Bin/trade/trading_tech/otm_puts && /mnt/d/Bin/trade/venv/bin/python /mnt/d/Bin/trade/trading_tech/otm_puts/get_quote.py`

`0 * * * * /mnt/d/Bin/trade/venv/bin/python /mnt/d/Bin/trade/trading_tech/otm_puts/tda_api.py --tda_api_program='watch_list_quotes' --save_location='/mnt/d/Bin/quotes'`

`1 * * * * /mnt/d/Bin/trade/venv/bin/python /mnt/d/Bin/trade/trading_tech/otm_puts/tda_api.py --tda_api_program='save_option_chains' --save_location='/mnt/f'`

`5,55 * * * * /mnt/d/Bin/trade/venv/bin/python /mnt/d/Bin/trade/trading_tech/otm_puts/tda_api.py --tda_api_program='index_put_iv' --save_location='/mnt/d/Bin/quotes'`
