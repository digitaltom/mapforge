# Selenium Webdriver
# https://rubydoc.info/github/jnicklas/capybara/Capybara/Selenium/Driver

# 0,0 is the middle of the element
def click_coord(selector, x, y)
  element = find(selector)
  page.driver.browser.action.move_to(element.native, x, y).click.perform
end

def hover_coord(selector, x, y)
  element = find(selector)
  page.driver.browser.action.move_to(element.native, x, y).perform
end
