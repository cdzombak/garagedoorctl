# garagedoorctl

## Hardware Setup

See:

- https://howchoo.com/g/yznmzmuxywu/how-to-control-your-garage-door-from-your-phone-using-a-raspberry-pi?ref=guide_callout
- https://pi4j.com/1.2/pins/model-zerow-rev1.html
- https://www.amazon.com/SainSmart-101-70-100-2-Channel-Relay-Module/product-reviews/B0057OC6D8/ref=cm_cr_arp_d_paging_btm_next_2?ie=UTF8&reviewerType=all_reviews&pageNumber=2

Essentially, get 5V supply and ground to the relay board; connect the control to RPi pin 11 (GPIO 0).

## Docker

```
curl -sSL https://get.docker.com | sh
```

## The garagedoorctl server

To build & run the server under Docker:

```
make run
```
