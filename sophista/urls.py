# -*- coding: utf-8 -*-

# == IMPORTS ======================================== #

from django.conf import settings
from django.conf.urls.defaults import *
from django.contrib import admin
from django.views.generic.simple import redirect_to
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf.urls.static import static


# == ADMIN ======================================== #

admin.autodiscover()

if settings.DEBUG:
  urlpatterns = static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


# == UTIL ======================================== #

def rut_roh(request):
  """ Simulates a server error """
  1/0
    
urlpatterns = patterns('',
  url(r'^dashboard/', include(admin.site.urls)),
  url(r'^', include('cms.urls')),
  # == test == #
  url(r'^rut-rot/$', rut_roh),
)

urlpatterns += patterns('',
    url(r'^', include('filer.server.urls')),
)

# == ASSETS ======================================== #

urlpatterns += staticfiles_urlpatterns()

if settings.DEBUG is False and settings.LOCAL_DEVELOPMENT is not True:
    urlpatterns += patterns('',
        url(r'^_static/(?P<path>.*)$', 'django.views.static.serve',
            {'document_root': settings.STATIC_ROOT}),
        url(r'^_assets/(?P<path>.*)$', 'django.views.static.serve',
            {'document_root': settings.MEDIA_ROOT}),
        url(r'', include('django.contrib.staticfiles.urls')),

    )

if settings.LOCAL_DEVELOPMENT:
    urlpatterns = patterns('',
        url(r'^_static/(?P<path>.*)$', 'django.views.static.serve',
          {'document_root': settings.STATIC_ROOT, 'show_indexes': True}),
        url(r'^_assets/(?P<path>.*)$', 'django.views.static.serve',
          {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
        url(r'', include('django.contrib.staticfiles.urls')),

    ) + urlpatterns
