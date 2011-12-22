# -*- coding: utf-8 -*-

# == IMPORTS ======================================== #

from hashlib import sha1
from datetime import datetime

import logging
import mimetypes
import re
import urllib
import simplejson

from django.db import models
from django.db.models import Q
from django.contrib.auth.models import User
from django.contrib.auth import models as auth_models
from django.contrib.markup.templatetags import markup
from django.contrib.sites.models import Site
from django.core.cache import cache
from django.core.urlresolvers import reverse
from django.conf import settings
from django.template.defaultfilters import slugify, striptags
from django.utils.translation import ugettext_lazy as _

from cms.models.pluginmodel import CMSPlugin
from cms.models.fields import PlaceholderField

from tinymce import models as tinymce_models
from tinymce.widgets import TinyMCE

from taggit.models import TagBase, ItemBase, TaggedItemBase
from taggit.managers import TaggableManager
from taggit_autosuggest.managers import TaggableManager

# hierarchy is busted
#from categories.managers import ModelCategoryManager, CategoryDescriptor

from treebeard.mp_tree import MP_Node

import filer
from filer import fields
from filer.fields import image, file
from filer.fields.image import FilerImageField
from filer.fields.file import FilerFileField


# == MODELS ======================================== #

class ItemStatusManager(models.Manager):

  def default(self):
    default = self.all()[:1]

    if len(default) == 0:
      return None
    else:
      return default[0]
            
class ItemStatus(models.Model):

  name = models.CharField(max_length=50)
  ordering = models.IntegerField(default=0)
  is_live = models.BooleanField(default=False, blank=True)

  objects = ItemStatusManager()

  class Meta:
    ordering = ('ordering', 'name')
    verbose_name_plural = _('Item statuses')

  def __unicode__(self):
    if self.is_live:
      return u'%s (live)' % self.name
    else:
      return self.name

class ItemManager(models.Manager):

  def active(self):
    # not yet expired and active
    now = datetime.now()
    return self.get_query_set().filter(
      Q(exp_date__isnull=True) |
      Q(exp_date__gte=now),
      pub_date__lte=now,
      is_active=True)

  def live(self, user=None):
    # get live items
    qs = self.active()
    if user is not None and user.is_superuser:
      # superuser vision
      return qs
    else:
      # normal users see live items
      return qs.filter(status__is_live=True)

# the custom tag model
class HierarchicalTag(TagBase):
  parent = models.ForeignKey('self', null=True, blank=True)

# the through model
class TaggedContentItem(ItemBase):
  content_object = models.ForeignKey('Item')
  tag = models.ForeignKey('HierarchicalTag', related_name='tags')

class Item(ItemBase):
  title = models.CharField(max_length=100)
  slug = models.SlugField(unique_for_year='pub_date')
  status = models.ForeignKey(ItemStatus, default=ItemStatus.objects.default)
  author = models.ForeignKey(User, blank=False, default='admin')
  sites = models.ManyToManyField(Site, blank=True)

  # publishing
  pub_date = models.DateTimeField(default=datetime.now, help_text=_('The date and time this item shall appear online.'))
  exp_date = models.DateTimeField(blank=True, null=True, help_text=_('Leave blank if the item does not expire.'))
 
  # meta
  keywords = models.CharField(max_length=256,blank=True, help_text=_("If omitted, the keywords will be the same as the item tags."))
  description = models.CharField(max_length=156, blank=True, help_text=_("If omitted, the description will be determined by the first bit of the item's content."))

  # organize/taxonomizing!
  tags = TaggableManager(through=TaggedContentItem, blank=True)
  def get_tags(self):
    return self.tags.through.objects.filter(content_object=self)

  categories = models.ForeignKey('categories.Category', null=True, blank=True)
  def get_categories(self):
    return self.categories
    #return self.categories.item_set.all().filter(pk=self.pk)

  def get_categories_by_name(self):
    return self.categories.item_set.all()

  # content

  main_content = PlaceholderField('main_content')

  source_attribution = models.CharField(blank=True, max_length=255)
  
  poster_image = FilerImageField(related_name="mapper_item_poster_image", null=True, blank=True)
  def get_poster_image(self):
    url = ''
    if self.poster_image:
      url = self.poster_image.url
    return url

  video_poster_image = FilerImageField(related_name="mapper_item_video_poster_image", null=True, blank=True)
  def get_video_poster(self):
    url = ''
    if self.video_poster_image:
      url = self.video_poster_image.url
    return url

  item_content_upload = FilerFileField(related_name="mapper_item_content_upload", null=True, blank=True)
  def get_item_content_upload(self):
    url = ''
    if self.item_content_upload:
      url = self.item_content_upload.url
    return url
  
  explicit_url = models.URLField(null=True, blank=True)
  def get_url(self):
    url = ''
    if self.explicit_url:
      url = self.explicit_url
    return url

  # auth
  is_active=models.BooleanField(blank=True)
  login_required = models.BooleanField(blank=True, help_text=_('Enable this if users must login before they can read this item.'))
  
  objects = ItemManager()

  class Admin:
    fields = ('category',)
    search_fields = ('source_attribution', 'tags', 'categories', 'main_content',)

  class Meta:
    ordering = ('-pub_date', 'title')
    get_latest_by = 'pub_date'
    
  @models.permalink
  def get_absolute_url(self):
    return ('items_display_item', [self.pub_date.year, str(self.slug)])
      
  """
  def get_absolute_url(self):
    return reverse('items_display_item', args=[self.pk])
  """
  
  """  
  @models.permalink
  def get_absolute_url(self):
      return ('items_display_item', [str(self.id)])
  """
    
  #def copy_relations(self, oldinstance):
    #self.sections = oldinstance.sections.all()
    
  def __unicode__(self):
    return self.title
    
class MapperPlugin(CMSPlugin):
  item = models.ForeignKey('mapper.Item', related_name='plugins')

  def __unicode__(self):
    return self.item.title
    
    


