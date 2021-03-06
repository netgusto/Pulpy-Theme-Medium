// Generated by CoffeeScript 1.7.1
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define(['jquery'], function($) {
    'use strict';
    var ArticleAnimator;
    return ArticleAnimator = (function() {
      function ArticleAnimator(articleSelector) {
        this.elementToTemplate = __bind(this.elementToTemplate, this);
        this.createTemplateFromArticle = __bind(this.createTemplateFromArticle, this);
        this.injectPostInArticle = __bind(this.injectPostInArticle, this);
        this.scrollTop = __bind(this.scrollTop, this);
        this.animatePage = __bind(this.animatePage, this);
        this.fetchPostThenExecuteCallback = __bind(this.fetchPostThenExecuteCallback, this);
        this.getPostUrlFromSlug = __bind(this.getPostUrlFromSlug, this);
        this.pushCurrentState = __bind(this.pushCurrentState, this);
        this.getFollowingSlugFromArticleElement = __bind(this.getFollowingSlugFromArticleElement, this);
        this.getSlugFromArticleElement = __bind(this.getSlugFromArticleElement, this);
        this.notifyTheWorldAboutHtml5PostChange = __bind(this.notifyTheWorldAboutHtml5PostChange, this);
        this.postHasChanged = __bind(this.postHasChanged, this);
        var eventname;
        this.canScroll = true;
        $(window).on('mousewheel', (function(_this) {
          return function(e) {
            if (!_this.canScroll) {
              return e.preventDefault();
            }
          };
        })(this));
        $(window).on('load', (function(_this) {
          return function(e) {
            return _this.everPushedSomething = false;
          };
        })(this));
        $(window).on('popstate', (function(_this) {
          return function(e) {
            if (!_this.everPushedSomething) {
              return;
            }
            if (!window.posts[history.state.slug]) {
              _this.fetchPostThenExecuteCallback(history.state.slug, function(post) {
                window.posts[post.slug] = post;
                _this.injectPostInArticle(_this.currentArticle, post);
                return _this.notifyTheWorldAboutHtml5PostChange(post);
              });
            } else {
              _this.injectPostInArticle(_this.currentArticle, window.posts[history.state.slug]);
              _this.notifyTheWorldAboutHtml5PostChange(window.posts[history.state.slug]);
            }
            if (history.state.followingslug) {
              if (!window.posts[history.state.followingslug]) {
                return _this.fetchPostThenExecuteCallback(history.state.followingslug, function(post) {
                  window.posts[post.slug] = post;
                  if (!_this.followingArticle.get(0).parentNode) {
                    _this.followingArticle.insertAfter(_this.currentArticle);
                  }
                  return _this.injectPostInArticle(_this.followingArticle, post);
                });
              } else {
                if (!_this.followingArticle.get(0).parentNode) {
                  _this.followingArticle.insertAfter(_this.currentArticle);
                }
                return _this.injectPostInArticle(_this.followingArticle, window.posts[history.state.followingslug]);
              }
            } else {
              return _this.followingArticle.remove();
            }
          };
        })(this));
        this.articleSelector = articleSelector;
        this.currentArticleSelector = this.articleSelector + '.current';
        this.followingArticleSelector = this.articleSelector + '.following';
        this.currentArticle = $(this.currentArticleSelector);
        this.followingArticle = $(this.followingArticleSelector);
        this.articleTemplate = this.createTemplateFromArticle(this.currentArticle);
        this.followingTemplate = this.createTemplateFromArticle(this.followingArticle);
        eventname = 'click';
        $('html').on(eventname, this.followingArticleSelector + ' .big-image', (function(_this) {
          return function(e) {
            e.preventDefault();
            _this.followingArticle.removeClass('next-hidden');
            return _this.animatePage(function(post) {
              _this.notifyTheWorldAboutHtml5PostChange(post);
              return _this.postHasChanged(post);
            });
          };
        })(this));
        this.pushCurrentState(true);
      }

      ArticleAnimator.prototype.postHasChanged = function(post) {
        return window.document.title = window.titlepattern.replace(/\=posttitle\=/, post.title);
      };

      ArticleAnimator.prototype.notifyTheWorldAboutHtml5PostChange = function(post) {
        this.postHasChanged(post);
        $('html').trigger('pulpy:html5postchange', {
          post: post
        });
        return $('html').trigger('pulpy:html5urlchange', {
          url: post.url
        });
      };

      ArticleAnimator.prototype.getSlugFromArticleElement = function(article) {
        return article.attr('data:slug');
      };

      ArticleAnimator.prototype.getFollowingSlugFromArticleElement = function(article) {
        return article.attr('data:followingslug');
      };

      ArticleAnimator.prototype.pushCurrentState = function(replace) {
        var currentArticleSlug, followingArticleSlug, pagestate;
        if (replace == null) {
          replace = false;
        }
        this.everPushedSomething = true;
        currentArticleSlug = this.getSlugFromArticleElement(this.currentArticle);
        followingArticleSlug = this.getFollowingSlugFromArticleElement(this.currentArticle);
        pagestate = {
          slug: currentArticleSlug,
          followingslug: followingArticleSlug
        };
        if (replace) {
          return history.replaceState(pagestate, "", this.getPostUrlFromSlug(currentArticleSlug));
        } else {
          return history.pushState(pagestate, "", this.getPostUrlFromSlug(currentArticleSlug));
        }
      };

      ArticleAnimator.prototype.getPostUrlFromSlug = function(slug) {
        return window.posturl.replace(/\=slug\=/, slug);
      };

      ArticleAnimator.prototype.fetchPostThenExecuteCallback = function(slug, cbk) {
        var jsonposturl;
        jsonposturl = window.jsonposturl.replace(/\=slug\=/, slug);
        return $.ajax(jsonposturl, {
          type: 'GET',
          success: cbk
        });
      };

      ArticleAnimator.prototype.animatePage = function(cbk) {
        var timeoutFunc, translationValue;
        this.canScroll = false;
        translationValue = this.followingArticle.get(0).getBoundingClientRect().top;
        this.currentArticle.addClass('fade-up-out');
        this.followingArticle.removeClass('content-hidden following').addClass('easing-upward').css({
          "transform": "translate3d(0, -" + translationValue + "px, 0)"
        });
        timeoutFunc = (function(_this) {
          return function() {
            var doWhenPostAvailable, followingslug;
            _this.scrollTop();
            _this.followingArticle.removeClass('easing-upward');
            _this.currentArticle.remove();
            _this.followingArticle.css({
              "transform": ""
            });
            _this.followingArticle.addClass('current');
            _this.currentArticle = _this.followingArticle;
            cbk(window.posts[_this.getSlugFromArticleElement(_this.currentArticle)]);
            _this.followingArticle = _this.followingTemplate.clone();
            _this.canScroll = true;
            followingslug = _this.currentArticle.attr('data:followingslug');
            if (followingslug && followingslug !== 'null') {
              doWhenPostAvailable = function(post) {
                _this.injectPostInArticle(_this.followingArticle, post);
                _this.followingArticle.insertAfter(_this.currentArticle);
                return _this.pushCurrentState();
              };
              if (window.posts[followingslug]) {
                return doWhenPostAvailable(window.posts[followingslug]);
              } else {
                return _this.fetchPostThenExecuteCallback(followingslug, function(post) {
                  window.posts[post.slug] = post;
                  return doWhenPostAvailable(post);
                });
              }
            } else {
              return _this.pushCurrentState();
            }
          };
        })(this);
        return window.setTimeout(timeoutFunc, 500);
      };

      ArticleAnimator.prototype.scrollTop = function() {
        return $(document.body).add($(window.html)).add($('.scroller')).scrollTop(0);
      };

      ArticleAnimator.prototype.injectPostInArticle = function(article, post) {
        var bgimage;
        bgimage = post.image ? 'url(' + post.image + ')' : '';
        article.attr('data:slug', post.slug);
        article.attr('data:followingslug', post.previous_slug);
        article.find('.big-image').css({
          backgroundImage: bgimage
        });
        article.find('h1.title').html(post.title || '');
        article.find('h2.description').html(post.intro || '');
        article.find('.content .text').html(post.content || '');
        article.find('h3.byline time').html(post.date_human || '');
        article.find('h3.byline .author').html(post.author || '');
        article.find('h3.byline .about').html(post.about || '');
        return article;
      };

      ArticleAnimator.prototype.createTemplateFromArticle = function(article) {
        var template;
        template = article.clone();
        template.removeClass('next-hidden');
        return this.injectPostInArticle(template, {});
      };

      ArticleAnimator.prototype.elementToTemplate = function(element) {
        return $(element).get(0).outerHTML;
      };

      return ArticleAnimator;

    })();
  });

}).call(this);
