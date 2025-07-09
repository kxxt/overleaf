FROM debian:testing

ENV TEXMFVAR=/var/lib/sharelatex/tmp/texmf-var

RUN echo "deb http://mirrors.ustc.edu.cn/debian/ testing main" > /etc/apt/sources.list
RUN echo "deb http://mirrors.ustc.edu.cn/debian/ testing-updates main" >> /etc/apt/sources.list
RUN apt-get update && apt install -y --no-install-recommends fontconfig inkscape pandoc python3-pygments xfonts-utils curl xz-utils

# add truetype fonts
RUN mkdir -p /usr/share/fonts/truetype
ADD ./msttcorefonts /usr/share/fonts/truetype
RUN cd /usr/share/fonts/truetype && mkfontscale && mkfontdir && fc-cache -fsv
# Install otf fonts for typst
RUN apt-get install -y --no-install-recommends fonts-texgyre fonts-texgyre-math
# RUN apt-cache depends texlive-full | grep "Depends: " | grep -v -- "-doc" | grep -v -- "-lang-" | sed 's/Depends: //' | xargs apt-get install -y --no-install-recommends

RUN apt-cache depends texlive-full | grep "Depends: " | grep -v -- "-doc" | sed 's/Depends: //' | xargs apt-get install -y

# RUN apt install -y texlive-full texlive-lang-cjk texlive-lang-chinese texlive-lang-japanese texlive-lang-korean texlive-font-utils texlive-fonts-extra texlive-extra-utils texlive-science

# Typst
COPY typst-wrapper /usr/bin/typst-wrapper

RUN useradd tex
USER tex
