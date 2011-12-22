# -*- coding: utf-8 -*-
import os

# == celery

import djcelery
djcelery.setup_loader()

gettext = lambda s: s

PROJECT_DIR = os.path.dirname(__file__)

DEBUG = True
TEMPLATE_DEBUG = DEBUG
LOCAL_DEVELOPMENT = True

ADMINS = (
  ('nerdfiles', 'nerdfiles@gmail.com'),
  ('Leah Gilman', 'gilman.leah@gmail.com'),
)

MANAGERS = ADMINS

INTERNAL_IPS = ('127.0.0.1',)

LANGUAGES = [('en', 'en')]
DEFAULT_LANGUAGE = 0

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(PROJECT_DIR, 'database.sqlite'),
    }
}

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'America/Chicago'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale
USE_L10N = True

THEME = "vanilla"
THEME_DIR = os.path.join(PROJECT_DIR, "_themes", THEME)

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/"
#MEDIA_ROOT = os.path.join(PROJECT_DIR, '_themes/vanilla/_assets')
MEDIA_ROOT = os.path.realpath(os.path.join(THEME_DIR, "_assets"))
MEDIA_PATH = MEDIA_ROOT # for editor settings.MEDIA_PATH + "jquery.treeTable.css", error

#STATIC_ROOT = os.path.join(PROJECT_DIR, '_static')
STATIC_ROOT = os.path.realpath(os.path.join(PROJECT_DIR, "_static"))

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash if there is a path component (optional in other cases).
# Examples: "http://media.lawrence.com", "http://example.com/media/"
MEDIA_URL = '/_themes/vanilla/_assets/'

STATIC_URL = '/_static/'

# URL prefix for admin media -- CSS, JavaScript and images. Make sure to use a
# trailing slash.
# Examples: "http://foo.com/media/", "/media/".
#ADMIN_MEDIA_PREFIX = '/_static/admin/'
ADMIN_MEDIA_PREFIX = '%sadmin/' % MEDIA_URL

# Make this unique, and don't share it with anybody.
SECRET_KEY = '0r6%7gip5tmez*vygfv+u14h@4lbt^8e2^26o#5_f_#b7%cm)u'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'cms.middleware.page.CurrentPageMiddleware',
    'cms.middleware.user.CurrentUserMiddleware',
    'cms.middleware.toolbar.ToolbarMiddleware',
)

if DEBUG:
  MIDDLEWARE_CLASSES += ('debug_toolbar.middleware.DebugToolbarMiddleware',)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.auth',
    'django.core.context_processors.i18n',
    'django.core.context_processors.request',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'cms.context_processors.media',
    'sekizai.context_processors.sekizai',
)

if DEBUG:
  TEMPLATE_CONTEXT_PROCESSORS += ('django.core.context_processors.debug',)
if USE_I18N:
  TEMPLATE_CONTEXT_PROCESSORS += ('django.core.context_processors.i18n',)

CMS_TEMPLATES = (
    ('test.html', 'Test Template'),
)

THUMBNAIL_PROCESSORS = (
    'easy_thumbnails.processors.colorspace',
    'easy_thumbnails.processors.autocrop',
    #'easy_thumbnails.processors.scale_and_crop',
    'filer.thumbnail_processors.scale_and_crop_with_subject_location',
    'easy_thumbnails.processors.filters',
)

ROOT_URLCONF = 'urls'

TEMPLATE_DIRS = (
  os.path.join(PROJECT_DIR, "_themes", THEME, "_templates"),
)

INSTALLED_APPS = (

    # django core
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.admin',
    'django.contrib.staticfiles',

    # cms
    'cms',
    'mptt',
    
    # menus
    'treemenus',
    'menus',

    # migration/fixtures
    'south',
    'fixture_magic',
    'fixture_generator',
    'django_evolution',

    # additional content plugins
    'cms.plugins.text',
    'cms.plugins.picture',
    'cms.plugins.link',
    'cms.plugins.file',
    'cms.plugins.snippet',
    'cms.plugins.googlemap',

    # templating/frontend
    'sekizai',

    # taxonomy/relationships
    'categories',
    'treebeard',
    'taggit',

    # file uploading
    'filer',
    'easy_thumbnails',

    # testing
    'django_pdb',
    'test_utils',

    # tools
    'django_extensions',

)

INSTALLED_APPS += ("djcelery",)

if DEBUG:
  INSTALLED_APPS += ("debug_toolbar",)

  DEBUG_TOOLBAR_PANELS = (
      'debug_toolbar.panels.version.VersionDebugPanel',
      'debug_toolbar.panels.timer.TimerDebugPanel',
      'debug_toolbar.panels.settings_vars.SettingsVarsDebugPanel',
      'debug_toolbar.panels.headers.HeaderDebugPanel',
      'debug_toolbar.panels.request_vars.RequestVarsDebugPanel',
      'debug_toolbar.panels.template.TemplateDebugPanel',
      'debug_toolbar.panels.sql.SQLDebugPanel',
      'debug_toolbar.panels.signals.SignalDebugPanel',
      'debug_toolbar.panels.logger.LoggingPanel',
  )

  def custom_show_toolbar(request):
      return True # Always show toolbar, for example purposes only.

  DEBUG_TOOLBAR_CONFIG = {
      'INTERCEPT_REDIRECTS': False,
      'SHOW_TOOLBAR_CALLBACK': custom_show_toolbar,
      #'EXTRA_SIGNALS': ['myproject.signals.MySignal'],
      'MEDIA_URL': STATIC_URL + 'debug_toolbar/',
      'HIDE_DJANGO_SQL': False,
      'TAG': 'div',
  }

