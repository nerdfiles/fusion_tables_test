from django.conf.urls.defaults import *
from django.contrib import admin
from django.conf import settings

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^dashboard/', include(admin.site.urls)),
    url(r'^', include('cms.urls')),
)

if settings.LOCAL_DEVELOPMENT:
    urlpatterns = patterns('',
        url(r'^_assets/(?P<path>.*)$', 'django.views.static.serve',
        {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
        url(r'', include('django.contrib.staticfiles.urls')),
    ) + urlpatterns

